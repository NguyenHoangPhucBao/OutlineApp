import json
import secrets
from datetime import datetime

import cloudinary.uploader
from django.core.mail import send_mail
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from oauth2_provider.models import AccessToken, get_access_token_model
from oauth2_provider.signals import app_authorized
from oauth2_provider.views import TokenView
from rest_framework import viewsets, generics, status, permissions, parsers
from rest_framework.decorators import action
from rest_framework.response import Response

from CompileSubjectOutlineApp import settings
from MainApp import permissions as perms, docx_generate
from MainApp import serializers, paginators
from MainApp.models import *


class SubjectObjectiveViewSet(
    viewsets.ViewSet,
    generics.DestroyAPIView,
    generics.UpdateAPIView
):
    queryset = SubjectObjective.objects.filter(is_active=True)
    serializer_class = serializers.SubjectObjectiveSerializer
    permission_classes = [perms.SubjectOutlineCreatorPermission]


class SubjectOutComeStandardViewSet(
    viewsets.ViewSet,
    generics.DestroyAPIView,
    generics.UpdateAPIView
):
    queryset = SubjectOutcomeStandard.objects.filter(is_active=True)
    serializer_class = serializers.SubjectOutComeStandardSerializer
    permission_classes = [perms.SubjectOutlineCreatorPermission]


class EvaluationTestViewSet(
    viewsets.ViewSet,
    generics.DestroyAPIView,
    generics.UpdateAPIView
):
    queryset = EvaluationTest.objects.filter(is_active=True)
    serializer_class = serializers.EvaluationTestSerializer
    permission_classes = [perms.SubjectOutlineCreatorPermission]


class TeachingPlanViewSet(
    viewsets.ViewSet,
    generics.DestroyAPIView,
    generics.UpdateAPIView
):
    queryset = TeachingPlan.objects.all()
    serializer_class = serializers.TeachingPlanSerializer
    permission_classes = [perms.SubjectOutlineCreatorPermission]


class SubjectViewSet(
    viewsets.ViewSet,
    generics.ListAPIView
):
    queryset = Subject.objects.filter(is_active=True)
    serializer_class = serializers.SubjectSerializer


class SubjectOutLineViewSet(
    viewsets.ViewSet,
    generics.ListAPIView,
    generics.UpdateAPIView,
    generics.RetrieveAPIView
):
    queryset = SubjectOutline.objects.filter(is_active=True)
    serializer_class = serializers.SubjectOutLineSerializer
    pagination_class = paginators.OutlinePaginator

    def get_permissions(self):
        if self.action in [
            "update",
            "partial_update"
            "get_post_subject_objective",
            "get_post_subject_outcome",
            "get_post_evaluation_test",
            "get_post_teaching_plan",
            "post_subject_outline"
        ]:
            return [perms.SubjectOutlineCreatorPermission()]
        if self.action in ["approve_outline"]:
            return [perms.SubjectOutlineApproverPermission()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = self.queryset
        if not (self.request.user.role == 1 or self.request.user.role == 2):
            queryset = SubjectOutline.objects.filter(status=1)
        if self.action.__eq__("list"):
            key = self.request.query_params.get("key")
            cre_num = self.request.query_params.get("cre_num")
            status = self.request.query_params.get("status")
            lecturer = self.request.query_params.get("lecturer")
            if key:
                queryset = queryset.filter(
                    Q(subject__vie_name__icontains=key) | Q(subject__eng_name__icontains=key) | Q(
                        school_year__name__contains=key))
            if cre_num:
                queryset = queryset.select_related("subject").extra(
                    where=[f"MainApp_subject.theory_credit + MainApp_subject.practical_credit = {cre_num}"])
            if status:
                if status == "all":
                    queryset = queryset.filter(Q(status=1) | Q(status=0) | Q(status=2))
                else:
                    queryset = queryset.filter(status=status)
            if lecturer:
                if lecturer == "all":
                    queryset = queryset.filter(is_active=True)
                else:
                    queryset = queryset.filter(user__person_id=lecturer)
        return queryset

    @action(methods=["get", "post"], url_path="subject-objective", detail=True)
    def get_post_subject_objective(self, request, pk):
        if request.method.__eq__("GET"):
            subject_objective = self.get_object().subjectobjective_set.filter(is_active=True)
            return Response(serializers.SubjectObjectiveSerializer(subject_objective, many=True).data,
                            status=status.HTTP_200_OK)
        if request.method.__eq__("POST"):
            subject_objective = self.get_object().subjectobjective_set.create(
                name=request.data.get("name"),
                description=request.data.get("description"),
                standard=request.data.get("standard")
            )
            return Response(serializers.SubjectObjectiveSerializer(subject_objective).data,
                            status=status.HTTP_201_CREATED)

    @action(methods=["get", "post"], url_path="subject-outcome", detail=True)
    def get_post_subject_outcome(self, request, pk):
        if request.method.__eq__("GET"):
            subject_outcome = self.get_object().subjectoutcomestandard_set.filter(is_active=True)
            return Response(serializers.SubjectOutComeStandardSerializer(subject_outcome, many=True).data,
                            status=status.HTTP_200_OK)
        if request.method.__eq__("POST"):
            subject_outcome = self.get_object().subjectoutcomestandard_set.create(
                name=request.data.get("name"),
                description=request.data.get("description"),
                subject_objective__id=request.data.get("subject_objective_id")
            )
            return Response(serializers.SubjectOutComeStandardSerializer(subject_outcome).data,
                            status=status.HTTP_201_CREATED)

    @action(methods=["get", "post"], url_path="evaluation-test", detail=True)
    def get_post_evaluation_test(self, request, pk):
        evaluation_test = self.get_object().evaluationtest_set.filter(is_active=True).order_by("test_type")
        if request.method.__eq__("GET"):
            return Response(serializers.EvaluationTestSerializer(evaluation_test, many=True).data,
                            status=status.HTTP_200_OK)
        if request.method.__eq__("POST"):
            datas = serializers.EvaluationTestSerializer(evaluation_test, many=True).data
            total = 0
            for data in datas:
                ratio = data.get("score_ratio")
                total = total + ratio
            if evaluation_test.count() < 5:
                if (request.data.get("score_ratio") + total) < 100:
                    evalation_test = self.get_object().evaluationtest_set.create(
                        name=request.data.get("name"),
                        time=request.data.get("time"),
                        test_type__id=request.data.get("test_type_id"),
                        subject_standard__id=request.data.get("subject_standard_id"),
                        score_ratio=request.data.get("score_ratio")
                    )
                    return Response(serializers.EvaluationTestSerializer(evalation_test).data,
                                    status=status.HTTP_201_CREATED)
                return Response(status=status.HTTP_400_BAD_REQUEST)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["get", "post"], url_path="teaching-plan", detail=True)
    def get_post_teaching_plan(self, request, pk):
        if request.method.__eq__("GET"):
            teaching_plan = self.get_object().teachingplan_set.all()
            return Response(serializers.TeachingPlanSerializer(teaching_plan, many=True).data,
                            status=status.HTTP_200_OK)
        if request.method.__eq__("POST"):
            teaching_plan = self.get_object().teachingplan_set.create(
                school_week=request.data.get("school_week"),
                content=request.data.get("content"),
                activities=request.data.get("activities"),
                document=request.data.get("document"),
                subject_outcome_standard=request.data.get("subject_outcome_standard_id"),
                evaluation_test=request.data.get("evaluation_test")
            )
            return Response(serializers.TeachingPlanSerializer(teaching_plan).data,
                            status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='comments', detail=True)
    def get_comments(self, request, pk):
        comments = self.get_object().comment_set.select_related('user').order_by('-id')
        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

    @action(methods=["post"], url_path="comment", detail=True)
    def post_comment(self, request, pk):
        comment = self.get_object().comment_set.create(
            content=request.data.get("content"),
            user=request.user)
        return Response(serializers.CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(methods=["patch"], url_path="approve-outline", detail=True)
    def approve_outline(self, request, pk):
        outline = self.get_object()
        outline_status = request.query_params.get("status")
        print(outline_status)
        if outline_status:
            outline.status = int(outline_status)
        outline.save()
        return Response(status=status.HTTP_200_OK)

    @action(methods=["get"], url_path="download", detail=True)
    def download_outline(self, request, pk):
        outline = serializers.SubjectOutLineSerializer(self.get_object()).data
        objectives = serializers.SubjectObjectiveSerializer(
            self.get_object().subjectobjective_set.filter(is_active=True),
            many=True).data
        outcome_standards = serializers.SubjectOutComeStandardSerializer(
            self.get_object().subjectoutcomestandard_set.filter(is_active=True),
            many=True).data
        evaluation_tests = serializers.EvaluationTestSerializer(
            self.get_object().evaluationtest_set.filter(is_active=True).order_by("test_type"),
            many=True).data
        doc = docx_generate.docx_generate(self, outline=outline, objectives=objectives,
                                          outcome_standards=outcome_standards, evaluation_tests=evaluation_tests)
        subject = outline.get("subject")
        filename = subject.get("subject_id") + subject.get("vie_name") + outline.get("school_year")
        path = rf"C:\Users\admin\Documents\{filename}.docx"
        doc.save(path)
        res = cloudinary.uploader.upload(path, resource_type="raw")
        return Response(res.get("secure_url"))


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser, ]

    def create(self, request):
        new_user_id = request.data.get("user_id")
        new_username = request.data.get("username")
        user_id = User.objects.filter(person_id=new_user_id)
        person = get_object_or_404(Person, id=new_user_id)
        username = User.objects.filter(username=new_username)
        if user_id.exists():
            return Response("ERR_DUPLICATE_ID")
        if username.exists():
            return Response("ERR_DUPLICATE_USERNAME")
        password = secrets.token_urlsafe(16)
        new_user = User(
            person_id=new_user_id,
            username=new_username,
            password=password)
        new_user.set_password(password)
        new_user.save()
        context = {
            "receiver_name": new_user.person.last_name + new_user.person.first_name,
            "username": new_username,
            "password": password,
            "year": datetime.now().year
        }
        reciever_email = new_user.person.email
        template = "../templates/template.html"
        html_template = render_to_string(
            template_name=template,
            context=context
        )
        send_mail(
            subject="Registry complete email",
            message="",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[reciever_email, ],
            html_message=html_template,
        )
        return Response(serializers.UserSerializer(new_user).data, status=status.HTTP_201_CREATED)

    def get_permissions(self):
        if self.action in ["post_subject_outline"]:
            return [perms.SubjectOutlineCreatorPermission()]
        if self.action in ["create"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            username = request.data.get("username")
            avatar = request.data.get("avatar")
            current_password = request.data.get("current_password")
            if username is not None:
                check_user = User.objects.filter(username__contains=username).filter(username=username)
                if check_user.exists():
                    return Response("ERR_INVALID_USERNAME")
                else:
                    user.username = username
            else:
                user.username = user.username
            if avatar is not None:
                user.avatar = avatar
            if current_password is not None:
                if user.check_password(current_password):
                    user.set_password(request.data.get("new_password"))
                    user.save()
                    return Response(serializers.UserSerializer(user).data, status=status.HTTP_200_OK)
                return Response("ERR_WRONG_PASSWORD")
            user.save()
        return Response(serializers.UserSerializer(user).data, status=status.HTTP_200_OK)

    @action(methods=["post"], url_path="subject-outline", detail=True)
    def post_subject_outline(self, request, pk):
        outline = self.get_object().subjectoutline_set.create(
            subject_id=request.data.get("subject_id")
        )
        return Response(serializers.SubjectOutLineSerializer(outline).data, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer(many=True)
    permission_classes = [perms.CommentPermission]


class TokenView(TokenView):
    @method_decorator(sensitive_post_parameters("password"))
    def post(self, request, *args, **kwargs):
        url, headers, body, status = self.create_token_response(request)
        user = User.objects.filter(username__contains=request.POST["username"]).filter(
            username=request.POST["username"])
        if not user:
            return HttpResponse(content="ERR_INVALID_USERNAME")
        if status == 200:
            body = json.loads(body)
            access_token = body.get("access_token")
            if access_token is not None:
                token = get_access_token_model().objects.get(token=access_token)
                app_authorized.send(sender=self, request=request, token=token)
                body['is_first_login'] = False
                if AccessToken.objects.filter(user_id=token.user.id).count() == 1:
                    body['is_first_login'] = True
                role = "NORMAL"
                user_role = serializers.UserSerializer(User.objects.get(username=request.POST["username"])).data.get(
                    "role")
                if user_role == 1:
                    role = "CREATOR"
                if user_role == 2:
                    role = "APPROVER"
                body['role'] = role
                body = json.dumps(body)
        response = HttpResponse(content=body, status=status)

        for k, v in headers.items():
            response[k] = v
        return response


class PersonViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Person.objects.filter(is_lecturer=True)
    serializer_class = serializers.PersonSerializer
