from rest_framework import serializers

from MainApp.models import *


class SubjectObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectObjective
        fields = ["name", "description", "standard"]


class SubjectOutComeStandardSerializer(serializers.ModelSerializer):
    subject_objective = serializers.SlugRelatedField(read_only=True, slug_field="name")

    class Meta:
        model = SubjectOutcomeStandard
        fields = ["name", "description", "subject_objective"]


class EvaluationTestSerializer(serializers.ModelSerializer):
    subject_standard = SubjectOutComeStandardSerializer(many=True)
    test_type = serializers.SlugRelatedField(read_only=True, slug_field="name")

    class Meta:
        model = EvaluationTest
        fields = ["name", "score_ratio", "subject_standard", "test_type", "time"]


class TeachingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeachingPlan
        fields = ["id"]


class InsistenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["vie_name", "subject_id"]


class SubjectSerializer(serializers.ModelSerializer):
    knowledge_base = serializers.SlugRelatedField(read_only=True, slug_field="name")
    faculty = serializers.SlugRelatedField(read_only=True, slug_field="name")
    insistence = InsistenceSerializer(many=True)
    form_of_training = serializers.SlugRelatedField(read_only=True, slug_field="name")
    school_year = serializers.SlugRelatedField(read_only=True, slug_field="name")

    class Meta:
        model = Subject
        fields = [
            "id",
            "subject_id",
            "vie_name",
            "eng_name",
            "theory_credit",
            "practical_credit",
            "knowledge_base",
            "faculty",
            "insistence",
            "form_of_training",
            "school_year"
        ]


class SubjectOutLineSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer()
    school_year = serializers.SlugRelatedField(read_only=True, slug_field="name")

    class Meta:
        model = SubjectOutline
        fields = [
            "id",
            "description",
            "regulation",
            "document",
            "teaching_method",
            "subject",
            "school_year",
            "status",
            "is_active"
        ]


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    person = PersonSerializer()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if rep['avatar'] is None:
            rep['avatar'] = "https://res.cloudinary.com/dloydputi/image/upload/v1718012379/y7aukglbtagfcnwmhq7r.png"
        else:
            rep['avatar'] = instance.avatar.url
        return rep

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "username", "password", "avatar", "person", "role"]
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Comment
        fields = ["content", "user"]
