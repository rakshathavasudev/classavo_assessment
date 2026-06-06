from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Chapter, Course, Enrollment
from .permissions import IsCourseOwnerOrReadOnly, IsInstructor
from .serializers import (
    ChapterSerializer,
    CourseDetailSerializer,
    CourseSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    """Courses: instructors manage their own; everyone authenticated can browse."""

    permission_classes = [IsInstructor, IsCourseOwnerOrReadOnly]

    def get_permissions(self):
        # Joining / leaving is a student action, so only require authentication.
        if self.action in ("join", "leave"):
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        qs = Course.objects.select_related("instructor")
        mine = self.request.query_params.get("mine")
        if mine == "true":
            return qs.filter(instructor=self.request.user)
        if mine == "enrolled":
            return qs.filter(enrollments__student=self.request.user)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseSerializer

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    def get_object(self):
        # Bypass the list filters (e.g. ?mine) for single-object lookups.
        obj = get_object_or_404(
            Course.objects.select_related("instructor"), pk=self.kwargs["pk"]
        )
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        """Student enrolls in a course."""
        course = self.get_object()
        if request.user.is_instructor:
            raise PermissionDenied("Instructors cannot enroll in courses.")
        _, created = Enrollment.objects.get_or_create(
            student=request.user, course=course
        )
        if not created:
            return Response({"detail": "Already enrolled."}, status=status.HTTP_200_OK)
        return Response(
            {"detail": "Enrolled successfully."}, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        course = self.get_object()
        Enrollment.objects.filter(student=request.user, course=course).delete()
        return Response({"detail": "Left the course."}, status=status.HTTP_200_OK)


class ChapterViewSet(viewsets.ModelViewSet):
    """Chapters nested under a course. Visibility enforced per role."""

    serializer_class = ChapterSerializer
    permission_classes = [IsInstructor, IsCourseOwnerOrReadOnly]

    def _get_course(self):
        return get_object_or_404(Course, pk=self.kwargs["course_pk"])

    def get_queryset(self):
        course = self._get_course()
        qs = Chapter.objects.filter(course=course)
        user = self.request.user
        # The owning instructor sees all chapters; others see only public ones.
        if course.instructor_id != user.id:
            qs = qs.filter(is_public=True)
        return qs

    def get_object(self):
        chapter = get_object_or_404(
            Chapter, pk=self.kwargs["pk"], course_id=self.kwargs["course_pk"]
        )
        user = self.request.user
        if chapter.course.instructor_id != user.id and not chapter.is_public:
            raise PermissionDenied("This chapter is private.")
        self.check_object_permissions(self.request, chapter)
        return chapter

    def perform_create(self, serializer):
        course = self._get_course()
        if course.instructor_id != self.request.user.id:
            raise PermissionDenied("You can only add chapters to your own courses.")
        serializer.save(course=course)
