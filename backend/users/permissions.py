from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_admin

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Allow admin users
        if request.user.is_admin:
            return True
            
        # Allow the owner of the object
        return obj == request.user