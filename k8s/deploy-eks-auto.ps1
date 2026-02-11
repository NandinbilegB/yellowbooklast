#!/usr/bin/env pwsh

# EKS Cluster Deployment Automation - PowerShell Version
# Polls CloudFormation stack and automatically proceeds with deployment when ready

param(
    [string]$ClusterName = "yellbook-eks",
    [string]$StackName = "yellbook-eks-stack",
    [string]$Region = "ap-southeast-1",
    [string]$Namespace = "yellowbooks",
    [int]$CheckInterval = 30,
    [int]$MaxWaitTime = 2400  # 40 minutes
)

$ErrorActionPreference = "Stop"
$startTime = Get-Date

Write-Host "=========================================="
Write-Host "EKS Cluster Deployment Automation"
Write-Host "=========================================="
Write-Host "Cluster: $ClusterName"
Write-Host "Stack: $StackName"
Write-Host "Region: $Region"
Write-Host "Namespace: $Namespace"
Write-Host ""

function Get-StackStatus {
    try {
        $status = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --region $Region `
            --query 'Stacks[0].StackStatus' `
            --output text 2>/dev/null
        return $status
    }
    catch {
        return "ERROR"
    }
}

function Test-ClusterReady {
    try {
        $nodes = kubectl get nodes --no-headers 2>/dev/null | wc -l
        return $nodes -gt 0
    }
    catch {
        return $false
    }
}

# Wait for CloudFormation stack completion
Write-Host "⏳ Waiting for CloudFormation stack to complete..."
$stackComplete = $false

while ((Get-Date) - $startTime -lt [timespan]::FromSeconds($MaxWaitTime)) {
    $status = Get-StackStatus
    # $elapsed = ((Get-Date) - $startTime).TotalMinutes  # Used for monitoring
    
    if ($status -eq "ERROR") {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Status: CHECKING..." -ForegroundColor Yellow
    }
    elseif ($status -eq "CREATE_COMPLETE") {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Status: ✅ CREATE_COMPLETE" -ForegroundColor Green
        $stackComplete = $true
        break
    }
    elseif ($status -eq "ROLLBACK_COMPLETE" -or $status -like "*FAILED*") {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Status: ❌ $status" -ForegroundColor Red
        exit 1
    }
    else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Status: $status (${elapsed:F1} min)" -ForegroundColor Cyan
    }
    
    Start-Sleep -Seconds $CheckInterval
}

if (-not $stackComplete) {
    Write-Host ""
    Write-Host "❌ Timeout: Stack creation exceeded $($MaxWaitTime/60) minutes" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=========================================="
Write-Host "Starting Post-Deployment Steps"
Write-Host "=========================================="
Write-Host ""

# Step 1: Update kubeconfig
Write-Host "📋 Step 1: Updating kubeconfig..." -ForegroundColor Cyan
aws eks update-kubeconfig `
    --name $ClusterName `
    --region $Region

Start-Sleep -Seconds 5

# Verify connectivity
Write-Host "🔍 Verifying cluster connectivity..." -ForegroundColor Cyan
$nodes = kubectl get nodes 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to connect to cluster" -ForegroundColor Red
    exit 1
}

Write-Host $nodes
Write-Host ""

# Step 2: Setup ALB Controller
Write-Host "📦 Step 2: Setting up ALB Ingress Controller..." -ForegroundColor Cyan
$albScript = Join-Path $PSScriptRoot "k8s/setup-alb-controller.sh"

if (-not (Test-Path $albScript)) {
    Write-Host "❌ ALB setup script not found at $albScript" -ForegroundColor Red
    exit 1
}

bash $albScript

Write-Host ""

# Step 3: Deploy application
Write-Host "🚀 Step 3: Deploying application manifests..." -ForegroundColor Cyan
$deployScript = Join-Path $PSScriptRoot "k8s/post-cluster-deployment.sh"

if (-not (Test-Path $deployScript)) {
    Write-Host "❌ Deployment script not found at $deployScript" -ForegroundColor Red
    exit 1
}

bash $deployScript

Write-Host ""
Write-Host "=========================================="
Write-Host "✅ Deployment Complete!"
Write-Host "=========================================="
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Get Ingress ALB DNS: kubectl get ingress -n $Namespace"
Write-Host "2. Create Route53 record"
Write-Host "3. Update ACM certificate"
Write-Host "4. Monitor HPA: kubectl get hpa -n $Namespace -w"
Write-Host ""
Write-Host "View logs:"
Write-Host "  kubectl logs -f deployment/yellbook-api -n $Namespace"
Write-Host "  kubectl logs -f deployment/yellbook-web -n $Namespace"
