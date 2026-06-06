from django.contrib import admin

from .models import Chapter, Course, Enrollment


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 0
    fields = ("title", "is_public", "order")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "instructor", "created_at")
    search_fields = ("title",)
    inlines = [ChapterInline]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "is_public", "order")
    list_filter = ("is_public",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "joined_at")
