"""Seed the database with demo instructor, student, and course data."""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from courses.models import Chapter, Course, Enrollment

User = get_user_model()


def plate_doc(*paragraphs):
    """Build a minimal Plate.js document value from plain paragraphs."""
    return [{"type": "p", "children": [{"text": p}]} for p in paragraphs]


class Command(BaseCommand):
    help = "Create demo users and courses for local development."

    def handle(self, *args, **options):
        instructor, _ = User.objects.get_or_create(
            username="instructor",
            defaults={"email": "instructor@example.com", "role": User.Role.INSTRUCTOR},
        )
        instructor.role = User.Role.INSTRUCTOR
        instructor.set_password("password123")
        instructor.save()

        student, _ = User.objects.get_or_create(
            username="student",
            defaults={"email": "student@example.com", "role": User.Role.STUDENT},
        )
        student.role = User.Role.STUDENT
        student.set_password("password123")
        student.save()

        course, _ = Course.objects.get_or_create(
            title="Introduction to Django",
            instructor=instructor,
            defaults={"description": "Learn the basics of building web apps with Django."},
        )

        Chapter.objects.get_or_create(
            course=course,
            title="What is Django?",
            defaults={
                "is_public": True,
                "order": 1,
                "content": plate_doc(
                    "Django is a high-level Python web framework.",
                    "It encourages rapid development and clean, pragmatic design.",
                ),
            },
        )
        Chapter.objects.get_or_create(
            course=course,
            title="Models and the ORM",
            defaults={
                "is_public": True,
                "order": 2,
                "content": plate_doc(
                    "Models define the shape of your data.",
                    "The ORM lets you query the database using Python.",
                ),
            },
        )
        Chapter.objects.get_or_create(
            course=course,
            title="Draft: Advanced Querysets (private)",
            defaults={
                "is_public": False,
                "order": 3,
                "content": plate_doc("This chapter is still a private draft."),
            },
        )

        Enrollment.objects.get_or_create(student=student, course=course)

        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write("  Instructor -> username: instructor / password: password123")
        self.stdout.write("  Student    -> username: student / password: password123")
