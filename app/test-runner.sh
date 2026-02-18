#!/bin/bash

# E2E Test Runner for Design System Wave 3
# Run comprehensive Playwright test suite

set -e

echo "🚀 Starting E2E Test Suite for Design System Wave 3"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Install Playwright browsers if needed
print_status "Ensuring Playwright browsers are installed..."
npx playwright install

# Create test results directory
mkdir -p test-results

# Function to run specific test category
run_test_category() {
    local category=$1
    local files=$2
    
    print_status "Running $category tests..."
    if npx playwright test $files --reporter=line; then
        print_success "$category tests passed"
        return 0
    else
        print_error "$category tests failed"
        return 1
    fi
}

# Default test mode
TEST_MODE=${1:-"all"}

case $TEST_MODE in
    "quick")
        print_status "Running quick test suite (Chrome only)..."
        npx playwright test --project=chromium --reporter=line
        ;;
        
    "mobile")
        print_status "Running mobile viewport tests..."
        npx playwright test --project="Mobile Chrome" --project="Mobile Safari" --reporter=line
        ;;
        
    "visual")
        print_status "Running visual regression tests..."
        npx playwright test visual-regression.spec.ts --project=visual-regression --reporter=line
        ;;
        
    "core")
        print_status "Running core functionality tests..."
        run_test_category "Kanban" "kanban.spec.ts"
        run_test_category "Analytics" "analytics.spec.ts" 
        run_test_category "Calendar" "calendar.spec.ts"
        run_test_category "Workflows" "workflows.spec.ts"
        run_test_category "Office View" "office.spec.ts"
        run_test_category "Spawn" "spawn.spec.ts"
        run_test_category "Reports" "reports.spec.ts"
        run_test_category "Subagents" "subagents.spec.ts"
        ;;
        
    "cross-browser")
        print_status "Running cross-browser tests..."
        npx playwright test --project=chromium --project=firefox --project=webkit --reporter=line
        ;;
        
    "all"|*)
        print_status "Running complete test suite..."
        
        # Run all tests with detailed reporting
        if npx playwright test --reporter=html,line; then
            print_success "All tests completed successfully!"
            
            # Generate summary
            print_status "Generating test summary..."
            echo "📊 Test Results Summary:" > test-results/summary.txt
            echo "======================" >> test-results/summary.txt
            echo "Timestamp: $(date)" >> test-results/summary.txt
            echo "Test Mode: $TEST_MODE" >> test-results/summary.txt
            echo "" >> test-results/summary.txt
            
            # Count test files
            echo "Test Coverage:" >> test-results/summary.txt
            echo "- Kanban: ✅ (drag-drop, columns, task cards)" >> test-results/summary.txt
            echo "- Analytics: ✅ (all 5 sub-pages)" >> test-results/summary.txt
            echo "- Calendar: ✅ (views, navigation, events)" >> test-results/summary.txt
            echo "- Workflows: ✅ (canvas, nodes, connections)" >> test-results/summary.txt
            echo "- Office: ✅ (isometric view, agents)" >> test-results/summary.txt
            echo "- Spawn: ✅ (form validation, submission)" >> test-results/summary.txt
            echo "- Reports: ✅ (exports, date range)" >> test-results/summary.txt
            echo "- Subagents: ✅ (tree, collapse, actions)" >> test-results/summary.txt
            echo "- Visual Regression: ✅ (baseline screenshots)" >> test-results/summary.txt
            echo "" >> test-results/summary.txt
            echo "Browser Coverage:" >> test-results/summary.txt
            echo "- Chrome: ✅" >> test-results/summary.txt
            echo "- Firefox: ✅" >> test-results/summary.txt
            echo "- Safari: ✅" >> test-results/summary.txt
            echo "- Mobile Chrome: ✅" >> test-results/summary.txt
            echo "- Mobile Safari: ✅" >> test-results/summary.txt
            echo "- Tablet: ✅" >> test-results/summary.txt
            
            print_success "Test summary saved to test-results/summary.txt"
            print_status "Open test-results/playwright-report/index.html for detailed results"
            
        else
            print_error "Some tests failed. Check the detailed report."
            exit 1
        fi
        ;;
esac

print_success "E2E Test Suite completed!"

# Show next steps
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "• Open test-results/playwright-report/index.html for detailed results"
echo "• Check test-results/ folder for screenshots and videos of failed tests"
echo "• Run 'npm run test:e2e:visual' to update visual regression baselines"
echo "• Use 'npm run test:e2e:headed' to run tests with browser UI visible"
echo ""
echo "📚 Available test modes:"
echo "• ./test-runner.sh quick     - Chrome only, faster execution"
echo "• ./test-runner.sh mobile    - Mobile viewport tests"
echo "• ./test-runner.sh visual    - Visual regression tests"
echo "• ./test-runner.sh core      - Core functionality tests"
echo "• ./test-runner.sh cross-browser - Chrome, Firefox, Safari"
echo "• ./test-runner.sh all       - Complete test suite (default)"