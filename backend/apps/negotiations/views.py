from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from .models import CounterOffer, NegotiationStatus
from .serializers import CounterOfferSerializer
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.utils import extend_schema


class NegotiationListView(APIView):
    """
    GET: List active counter-offers where user is either buyer or farmer
    POST: Initiate a new counter-offer
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        negotiations = CounterOffer.objects.filter(
            Q(buyer=request.user) | Q(farmer=request.user)
        )
        serializer = CounterOfferSerializer(negotiations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(request=CounterOfferSerializer)
    def post(self, request):
        serializer = CounterOfferSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(buyer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class UpdateNegotiationStatusView(APIView):
    """
    POST: Accept or Reject a counter-offer
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=inline_serializer(
            name='NegotiationStatusUpdateSchema',
            fields={
                'status': serializers.ChoiceField(
                    choices=[NegotiationStatus.ACCEPTED, NegotiationStatus.REJECTED],
                    default=NegotiationStatus.ACCEPTED
                )
            }
        ),
        responses={200: CounterOfferSerializer}
    )
    def post(self, request, pk):
        try:
            negotiation = CounterOffer.objects.get(
                Q(id=pk) & (Q(buyer=request.user) | Q(farmer=request.user))
            )
        except CounterOffer.DoesNotExist:
            return Response({"error": "Negotiation not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status in [NegotiationStatus.ACCEPTED, NegotiationStatus.REJECTED]:
            negotiation.status = new_status
            negotiation.save()
            return Response(CounterOfferSerializer(negotiation).data, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid status update."}, status=status.HTTP_400_BAD_REQUEST)