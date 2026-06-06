from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def test_register_student_and_login(self):
        res = self.client.post(
            reverse("register"),
            {"username": "alice", "password": "password123", "role": "student"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="alice")
        self.assertEqual(user.role, "student")
        self.assertTrue(user.is_student)
        # Password is hashed, not stored in plain text.
        self.assertNotEqual(user.password, "password123")

        login = self.client.post(
            reverse("login"),
            {"username": "alice", "password": "password123"},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn("access", login.data)
        self.assertEqual(login.data["user"]["role"], "student")

    def test_register_instructor(self):
        res = self.client.post(
            reverse("register"),
            {"username": "bob", "password": "password123", "role": "instructor"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.get(username="bob").is_instructor)

    def test_login_with_wrong_password_fails(self):
        User.objects.create_user(username="carol", password="password123")
        res = self.client.post(
            reverse("login"),
            {"username": "carol", "password": "wrong"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self):
        self.assertEqual(
            self.client.get(reverse("me")).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_me_returns_current_user(self):
        User.objects.create_user(
            username="dave", password="password123", role="instructor"
        )
        token = self.client.post(
            reverse("login"),
            {"username": "dave", "password": "password123"},
            format="json",
        ).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(reverse("me"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["username"], "dave")
        self.assertTrue(res.data["is_instructor"])
