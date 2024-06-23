from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django import forms
from django.contrib import admin

from MainApp.models import *


class SubjectOutlineForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)
    regulation = forms.CharField(widget=CKEditorUploadingWidget)
    document = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = SubjectOutline
        fields = "__all__"


class SubjectOutlineAdminSite(admin.ModelAdmin):
    form = SubjectOutlineForm


admin.site.register(User)
admin.site.register(KnowledgeBase)
admin.site.register(Faculty)
admin.site.register(SchoolYear)
admin.site.register(FormOfTraining)
admin.site.register(Subject)
admin.site.register(SubjectObjective)
admin.site.register(SubjectOutcomeStandard)
admin.site.register(TestType)
admin.site.register(EvaluationTest)
admin.site.register(TeachingPlan)
admin.site.register(SubjectOutline)
admin.site.register(Comment)
admin.site.register(Person)
