from django.urls import path, include
from rest_framework import routers

from MainApp import views

r = routers.DefaultRouter()
r.register('subject-objective', views.SubjectObjectiveViewSet, basename='subjectobjectives')
r.register('subject', views.SubjectViewSet, basename='subjects')
r.register('subject-outcome-standard', views.SubjectOutComeStandardViewSet, basename='subjectoutcomestandards')
r.register('evaluation-test', views.EvaluationTestViewSet, basename='evaluationtests')
r.register('subject-outline', views.SubjectOutLineViewSet, basename='subjectoutlines')
r.register('teaching-plan', views.TeachingPlanViewSet, basename='teachingplans')
r.register('user', views.UserViewSet, basename='users')
r.register('comment', views.CommentViewSet, basename='comments')
r.register('person', views.PersonViewSet, basename="persons")

urlpatterns = [
    path('', include(r.urls))
]
