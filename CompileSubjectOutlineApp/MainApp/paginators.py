from rest_framework import pagination


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 10


class OutlinePaginator(pagination.PageNumberPagination):
    page_size = 4
