from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here


class Person(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    first_name = models.CharField(null=False, max_length=20)
    last_name = models.CharField(null=False, max_length=20)
    email = models.CharField(max_length=50)
    is_lecturer = models.BooleanField(default=False)

    def __str__(self):
        return "%s %s" % (self.last_name, self.first_name)


class User(AbstractUser):
    class ROLE(models.IntegerChoices):
        NORMAL = 0
        CREATOR = 1
        APPROVER = 2

    avatar = CloudinaryField(null=True, blank=True)
    role = models.IntegerField(choices=ROLE, default=ROLE.NORMAL)
    person = models.OneToOneField(Person, on_delete=models.SET_NULL, null=True)


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class GeneralModel(BaseModel):
    name = models.CharField(max_length=50)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class KnowledgeBase(GeneralModel):  # khối kiến thức
    pass


class Faculty(GeneralModel):  # khoa
    pass


class SchoolYear(GeneralModel):
    pass


class FormOfTraining(GeneralModel):  # hệ đào tạo
    pass


class Subject(BaseModel):
    subject_id = models.CharField(max_length=10, unique=True)
    vie_name = models.CharField(null=False, max_length=50)
    eng_name = models.CharField(null=False, max_length=50)
    theory_credit = models.IntegerField()
    practical_credit = models.IntegerField()
    knowledge_base = models.ForeignKey(KnowledgeBase, on_delete=models.SET_NULL, null=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True)
    insistence = models.ManyToManyField('self', blank=True)
    form_of_training = models.ForeignKey(FormOfTraining, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return "%s - %s - %s - %d(%d, %d) - %s" % (self.subject_id,
                                                   self.vie_name,
                                                   self.eng_name,
                                                   self.theory_credit + self.practical_credit,
                                                   self.theory_credit,
                                                   self.practical_credit,
                                                   self.form_of_training)


class SubjectOutline(BaseModel):
    class STATUS(models.IntegerChoices):
        PENDING = 0
        APPROVED = 1
        REJECTED = 2

    description = RichTextField(blank=True)
    document = RichTextField(blank=True)
    regulation = RichTextField(blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    school_year = models.ForeignKey(SchoolYear, on_delete=models.CASCADE, null=True)
    status = models.IntegerField(choices=STATUS, null=True)
    teaching_method = RichTextField(blank=True)

    def __str__(self):
        return "%s - %s" % (self.subject, self.school_year)


class SubjectObjective(GeneralModel):
    description = RichTextField()
    standard = RichTextField()
    subject_outline = models.ForeignKey(SubjectOutline, on_delete=models.CASCADE, null=True)


class SubjectOutcomeStandard(GeneralModel):
    description = RichTextField()
    subject_objective = models.ForeignKey(SubjectObjective, on_delete=models.CASCADE, null=True)
    subject_outline = models.ForeignKey(SubjectOutline, on_delete=models.CASCADE, null=True)


class TestType(GeneralModel):
    pass


class EvaluationTest(GeneralModel):
    test_type = models.ForeignKey(TestType, on_delete=models.CASCADE)
    time = RichTextField(blank=True)
    subject_standard = models.ManyToManyField(SubjectOutcomeStandard, blank=True)
    score_ratio = models.IntegerField()
    subject_outline = models.ForeignKey(SubjectOutline, on_delete=models.CASCADE, null=True)


class TeachingPlan(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    schoolweek = models.CharField(max_length=20)
    content = RichTextField()
    subject_outcome_standard = models.ManyToManyField(SubjectOutcomeStandard)
    activities = RichTextField()
    evaluation_test = models.ManyToManyField(EvaluationTest)
    document = models.CharField(max_length=255)
    subject_outline = models.ForeignKey(SubjectOutline, on_delete=models.CASCADE, null=True)


class Comment(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    outline = models.ForeignKey(SubjectOutline, on_delete=models.CASCADE, null=True)
    content = models.CharField(max_length=255)
