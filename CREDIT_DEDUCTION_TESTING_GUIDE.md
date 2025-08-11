# Credit Deduction Testing Guide

## 🎯 How to Check if Credits Are Being Deducted

### 🔧 **Testing Tools Available**

#### 1. **Credit Monitor (Real-time)**
- **Location**: Bottom-right corner of any page (development only)
- **Features**: 
  - Shows current credit balance
  - Auto-refreshes every 5 seconds
  - Displays recent credit changes with timestamps
  - Shows total used/purchased credits

#### 2. **Credit Deduction Tester**
- **Location**: `/credits` page (blue box)
- **Features**:
  - Test each AI feature individually
  - Add test credits for testing
  - View detailed test results
  - Console logging for debugging

#### 3. **Development Testing**
- **Location**: `/credits` page (orange box)
- **Features**:
  - Add credits instantly
  - Debug user data
  - Refresh user data manually

## 🧪 **Step-by-Step Testing Process**

### **Method 1: Using Credit Deduction Tester**

1. **Go to `/credits` page**
2. **Add test credits** (click "+10 Credits" or "+50 Credits")
3. **Test each AI feature**:
   - Click "Test Summarize Notes" (-1 credit)
   - Click "Test Draft Email" (-2 credits)  
   - Click "Test Analyze Surgeon" (-3 credits)
4. **Check results** in the "Test Results" section
5. **Verify** credits are deducted correctly

### **Method 2: Using Real AI Features**

1. **Enable Credit Monitor** (click "Credit Monitor" button bottom-right)
2. **Go to any surgeon** in your dashboard
3. **Open surgeon modal** and go to "AI Tools" tab
4. **Use AI features**:
   - Summarize Notes (1 credit)
   - Draft Outreach Email (2 credits)
   - Analyze Surgeon (3 credits)
5. **Watch Credit Monitor** for real-time changes
6. **Check console logs** for detailed information

### **Method 3: Manual Verification**

1. **Note current credits** (check header or Credit Monitor)
2. **Use an AI feature** (e.g., summarize notes)
3. **Refresh page** or click refresh button
4. **Verify credits decreased** by the correct amount
5. **Check analytics page** (`/analytics`) for usage tracking

## 📊 **What to Look For**

### **✅ Correct Behavior:**
- Credits decrease by exact amount (1, 2, or 3)
- Credit Monitor shows the change immediately
- Toast notification shows remaining credits
- Analytics page tracks the usage
- Console shows successful deduction logs

### **❌ Problems to Watch For:**
- Credits don't decrease after using AI features
- Credits decrease by wrong amount
- Error messages about insufficient credits
- Features work without deducting credits
- Credit balance doesn't refresh

## 🔍 **Debugging Steps**

### **If Credits Aren't Being Deducted:**

1. **Check Console Logs**:
   - Open browser dev tools (F12)
   - Look for credit deduction logs
   - Check for error messages

2. **Verify User Authentication**:
   - Make sure you're logged in
   - Check if user ID is correct in debug info

3. **Test Credit Addition**:
   - Use "Debug Data" button to verify database connection
   - Try adding test credits to ensure system works

4. **Check Network Requests**:
   - Open Network tab in dev tools
   - Look for API calls to `/app/user/actions`
   - Verify responses are successful

### **Common Issues & Solutions:**

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Credits don't decrease | AI feature not calling `checkAndUseAICredits` | Check component implementation |
| Wrong deduction amount | Incorrect feature type passed | Verify `AIFeatureType` values |
| Credits show old value | User data not refreshing | Click refresh or wait for auto-refresh |
| Error messages | Insufficient credits or database error | Add test credits and check console |

## 🎮 **Testing Scenarios**

### **Scenario 1: Normal Usage**
1. Start with 10+ credits
2. Use each AI feature once
3. Verify correct deductions (1, 2, 3 credits)

### **Scenario 2: Insufficient Credits**
1. Set credits to 1
2. Try to use "Analyze Surgeon" (3 credits)
3. Should show error message and not deduct

### **Scenario 3: Multiple Features**
1. Start with 20 credits
2. Use multiple features in sequence
3. Verify total deduction is correct

### **Scenario 4: Real-time Monitoring**
1. Enable Credit Monitor
2. Use AI features from surgeon modal
3. Watch credits change in real-time

## 📱 **Mobile Testing**
- Credit Monitor adapts to mobile screens
- All testing tools work on mobile
- Touch-friendly interface

## 🚀 **Production Notes**
- All testing tools are hidden in production
- Credit deduction works the same way
- Monitor through analytics page instead

## 📞 **Support**
If credits aren't deducting correctly:
1. Check this guide first
2. Use debugging tools provided
3. Check console logs for errors
4. Verify all testing scenarios

The credit system should work flawlessly with these testing tools! 🎉