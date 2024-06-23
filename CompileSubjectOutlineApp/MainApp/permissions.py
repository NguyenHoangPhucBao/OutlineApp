from rest_framework import permissions


class CommentPermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and request.user == obj.user


class SubjectOutlineCreatorPermission(permissions.IsAuthenticated):
    edit_methods = ["GET", "POST", "DELETE", "PUT", "PATCH"]

    def has_object_permission(self, request, view, obj):
        if request.method in self.edit_methods:
            return super().has_permission(request, view) and request.user.role == 1


class SubjectOutlineApproverPermission(permissions.IsAuthenticated):
    edit_methods = ["PATCH"]

    def has_object_permission(self, request, view, obj):
        if request.method in self.edit_methods:
            return super().has_permission(request, view) and request.user.role == 2
