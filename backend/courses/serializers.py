from rest_framework import serializers

from .models import Chapter, Course, Enrollment


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = [
            "id",
            "course",
            "title",
            "content",
            "is_public",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["course"]


class ChapterListSerializer(serializers.ModelSerializer):
    """Lightweight chapter representation for embedding in a course payload."""

    class Meta:
        model = Chapter
        fields = ["id", "title", "is_public", "order"]


class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)
    chapter_count = serializers.IntegerField(source="chapters.count", read_only=True)
    student_count = serializers.IntegerField(source="students.count", read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "instructor",
            "instructor_name",
            "chapter_count",
            "student_count",
            "is_enrolled",
            "is_owner",
            "created_at",
        ]
        read_only_fields = ["instructor"]

    def _user(self):
        request = self.context.get("request")
        return getattr(request, "user", None)

    def get_is_enrolled(self, obj) -> bool:
        user = self._user()
        if not user or not user.is_authenticated:
            return False
        return obj.enrollments.filter(student=user).exists()

    def get_is_owner(self, obj) -> bool:
        user = self._user()
        return bool(user and user.is_authenticated and obj.instructor_id == user.id)


class CourseDetailSerializer(CourseSerializer):
    """Course detail including the chapters the requesting user may see."""

    chapters = serializers.SerializerMethodField()

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ["chapters"]

    def get_chapters(self, obj):
        user = self._user()
        qs = obj.chapters.all()
        # The owning instructor sees every chapter; everyone else sees only public ones.
        if not (user and user.is_authenticated and obj.instructor_id == user.id):
            qs = qs.filter(is_public=True)
        return ChapterListSerializer(qs, many=True).data


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "course_title", "joined_at"]
        read_only_fields = ["student"]
