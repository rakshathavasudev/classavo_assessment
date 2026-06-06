from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a role that drives instructor vs student capabilities."""

    class Role(models.TextChoices):
        INSTRUCTOR = "instructor", "Instructor"
        STUDENT = "student", "Student"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    @property
    def is_instructor(self) -> bool:
        return self.role == self.Role.INSTRUCTOR

    @property
    def is_student(self) -> bool:
        return self.role == self.Role.STUDENT

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"
