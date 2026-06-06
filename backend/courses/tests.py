from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Chapter, Course, Enrollment

User = get_user_model()


class CourseApiTests(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username="ins", password="pw", role="instructor"
        )
        self.other_instructor = User.objects.create_user(
            username="ins2", password="pw", role="instructor"
        )
        self.student = User.objects.create_user(
            username="stu", password="pw", role="student"
        )
        self.course = Course.objects.create(
            title="Django 101", instructor=self.instructor
        )
        self.public_ch = Chapter.objects.create(
            course=self.course, title="Public", is_public=True
        )
        self.private_ch = Chapter.objects.create(
            course=self.course, title="Private", is_public=False
        )

    def auth(self, user):
        token = self.client.post(
            "/api/auth/login/",
            {"username": user.username, "password": "pw"},
            format="json",
        ).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    # ---- course creation / ownership ----

    def test_instructor_can_create_course(self):
        self.auth(self.instructor)
        res = self.client.post("/api/courses/", {"title": "New"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.get(title="New").instructor, self.instructor)

    def test_student_cannot_create_course(self):
        self.auth(self.student)
        res = self.client.post("/api/courses/", {"title": "Nope"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_instructor_cannot_edit_another_instructors_course(self):
        self.auth(self.other_instructor)
        res = self.client.patch(
            f"/api/courses/{self.course.id}/", {"title": "Hijack"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_listing_requires_authentication(self):
        self.assertEqual(
            self.client.get("/api/courses/").status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # ---- chapter visibility ----

    def test_owner_sees_all_chapters_in_detail(self):
        self.auth(self.instructor)
        res = self.client.get(f"/api/courses/{self.course.id}/")
        titles = [c["title"] for c in res.data["chapters"]]
        self.assertIn("Public", titles)
        self.assertIn("Private", titles)

    def test_student_sees_only_public_chapters_in_detail(self):
        self.auth(self.student)
        res = self.client.get(f"/api/courses/{self.course.id}/")
        titles = [c["title"] for c in res.data["chapters"]]
        self.assertEqual(titles, ["Public"])

    def test_student_can_read_public_chapter(self):
        self.auth(self.student)
        res = self.client.get(
            f"/api/courses/{self.course.id}/chapters/{self.public_ch.id}/"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_student_cannot_read_private_chapter(self):
        self.auth(self.student)
        res = self.client.get(
            f"/api/courses/{self.course.id}/chapters/{self.private_ch.id}/"
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_read_private_chapter(self):
        self.auth(self.instructor)
        res = self.client.get(
            f"/api/courses/{self.course.id}/chapters/{self.private_ch.id}/"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    # ---- chapter authoring ----

    def test_owner_can_create_chapter_with_plate_content(self):
        self.auth(self.instructor)
        content = [{"type": "p", "children": [{"text": "hello"}]}]
        res = self.client.post(
            f"/api/courses/{self.course.id}/chapters/",
            {"title": "Authored", "is_public": True, "content": content},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["content"], content)

    def test_non_owner_cannot_create_chapter(self):
        self.auth(self.other_instructor)
        res = self.client.post(
            f"/api/courses/{self.course.id}/chapters/",
            {"title": "Sneaky"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_toggle_visibility(self):
        self.auth(self.instructor)
        res = self.client.patch(
            f"/api/courses/{self.course.id}/chapters/{self.private_ch.id}/",
            {"is_public": True},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.private_ch.refresh_from_db()
        self.assertTrue(self.private_ch.is_public)

    # ---- enrollment ----

    def test_student_can_join_and_leave(self):
        self.auth(self.student)
        join = self.client.post(f"/api/courses/{self.course.id}/join/")
        self.assertEqual(join.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Enrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )
        # Joining again is idempotent.
        again = self.client.post(f"/api/courses/{self.course.id}/join/")
        self.assertEqual(again.status_code, status.HTTP_200_OK)

        leave = self.client.post(f"/api/courses/{self.course.id}/leave/")
        self.assertEqual(leave.status_code, status.HTTP_200_OK)
        self.assertFalse(
            Enrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )

    def test_instructor_cannot_join_course(self):
        self.auth(self.instructor)
        res = self.client.post(f"/api/courses/{self.course.id}/join/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_enrolled_filter_returns_only_enrolled_courses(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        other = Course.objects.create(title="Other", instructor=self.instructor)
        self.auth(self.student)
        res = self.client.get("/api/courses/?mine=enrolled")
        ids = [c["id"] for c in res.data]
        self.assertIn(self.course.id, ids)
        self.assertNotIn(other.id, ids)
