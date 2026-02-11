#!/bin/bash

# Monitor EKS CloudFormation stack creation
# Shows progress and alerts on completion or errors

CLUSTER_NAME="yellbook-eks"
REGION="ap-southeast-1"
STACK_NAME="yellbook-eks-stack"

echo "=========================================="
echo "EKS CloudFormation Stack Monitoring"
echo "=========================================="
echo "Stack: $STACK_NAME"
echo "Region: $REGION"
echo ""

# Function to get stack status
get_stack_status() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].StackStatus' \
    --output text 2>/dev/null || echo "STACK_NOT_FOUND"
}

# Function to get detailed events
get_stack_events() {
  aws cloudformation describe-stack-events \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'StackEvents[0:5].[Timestamp,ResourceType,LogicalResourceId,ResourceStatus,ResourceStatusReason]' \
    --output table
}

# Monitoring loop
PREVIOUS_STATUS=""
ERROR_COUNT=0
MAX_WAIT_TIME=3600  # 60 minutes
START_TIME=$(date +%s)

while true; do
  CURRENT_STATUS=$(get_stack_status)
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  ELAPSED_MIN=$((ELAPSED / 60))
  
  if [ "$CURRENT_STATUS" != "$PREVIOUS_STATUS" ]; then
    echo "[$(date +'%H:%M:%S')] Status: $CURRENT_STATUS (Elapsed: ${ELAPSED_MIN}m)"
    PREVIOUS_STATUS="$CURRENT_STATUS"
  fi
  
  # Check for success
  if [ "$CURRENT_STATUS" = "CREATE_COMPLETE" ]; then
    echo ""
    echo "=========================================="
    echo "✅ EKS Cluster Created Successfully!"
    echo "=========================================="
    echo ""
    get_stack_events
    echo ""
    
    # Get cluster details
    echo "📋 Cluster Details:"
    aws eks describe-cluster \
      --name "$CLUSTER_NAME" \
      --region "$REGION" \
      --query 'cluster.[name,version,status,resourcesVpcConfig.subnetIds,resourcesVpcConfig.securityGroupIds]' \
      --output text
    
    echo ""
    echo "Next steps:"
    echo "1. aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION"
    echo "2. kubectl get nodes"
    echo "3. ./k8s/setup-alb-controller.sh"
    echo "4. ./k8s/post-cluster-deployment.sh"
    break
  fi
  
  # Check for rollback/failure
  if [ "$CURRENT_STATUS" = "ROLLBACK_COMPLETE" ] || [ "$CURRENT_STATUS" = "CREATE_FAILED" ]; then
    echo ""
    echo "=========================================="
    echo "❌ Stack Creation Failed: $CURRENT_STATUS"
    echo "=========================================="
    echo ""
    get_stack_events
    
    # Get failure reasons
    echo ""
    echo "Detailed Error Information:"
    aws cloudformation describe-stack-events \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`].[ResourceType,LogicalResourceId,ResourceStatusReason]' \
      --output text
    
    exit 1
  fi
  
  # Timeout check
  if [ $ELAPSED -gt $MAX_WAIT_TIME ]; then
    echo ""
    echo "=========================================="
    echo "⏱️  Timeout: Stack creation exceeded 1 hour"
    echo "=========================================="
    exit 1
  fi
  
  # Wait before next check (every 30 seconds)
  sleep 30
done
