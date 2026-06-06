from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChapterViewSet, CourseViewSet

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")

# Nested chapter routes: /courses/<course_pk>/chapters/...
chapter_list = ChapterViewSet.as_view({"get": "list", "post": "create"})
chapter_detail = ChapterViewSet.as_view(
    {
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy",
    }
)

urlpatterns = [
    path("", include(router.urls)),
    path(
        "courses/<int:course_pk>/chapters/",
        chapter_list,
        name="chapter-list",
    ),
    path(
        "courses/<int:course_pk>/chapters/<int:pk>/",
        chapter_detail,
        name="chapter-detail",
    ),
]
