from rest_framework import permissions


class IsInstructor(permissions.BasePermission):
    """Only users with the instructor role may write."""

    message = "Only instructors can perform this action."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return bool(request.user and request.user.is_authenticated and request.user.is_instructor)


class IsCourseOwnerOrReadOnly(permissions.BasePermission):
    """Write access to a course/chapter is limited to the owning instructor."""

    message = "You can only modify your own courses."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        instructor = getattr(obj, "instructor", None) or getattr(obj.course, "instructor", None)
        return instructor == request.user
