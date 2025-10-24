# Tutorial Page Template Guide

This guide provides a reusable template for creating interactive tutorial pages matching the style of `install_roblox_studio.html`.

## Overview

The tutorial template includes:
- ✅ Game-style header with dynamic stats bar
- ✅ Interactive checkboxes for step tracking
- ✅ **Backend API integration** for progress tracking
- ✅ **Real-time XP and level updates**
- ✅ **Offline queue** for failed requests
- ✅ Progress saving to localStorage (backup)
- ✅ Responsive design for mobile/tablet/desktop
- ✅ Consistent styling with v9_game_style.html
- ✅ Integration with authentication system
- ✅ **Student session management**
- ✅ **Progress restore** from backend

---

## File Structure

```
/Users/chrislee/Project/Web_Service/
├── [tutorial-name].html          # Main tutorial file
├── assets/
│   └── js/
│       └── auth.js                # Already included (session management)
└── student/
    └── dashboard.html             # Return destination
```

---

## Complete HTML Template

### Basic Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Tutorial Title] - Tutorial</title>
    <script src="assets/js/auth.js"></script>
    <style>
        /* COPY STYLES FROM SECTION BELOW */
    </style>
</head>
<body>

<div class="container">
    <!-- Header -->
    <header>
        <div class="header-content">
            <h1>[EMOJI] [Tutorial Title]</h1>
            <p>[Subtitle describing the tutorial]</p>
        </div>
        <a href="student/dashboard.html" class="back-button">← Dashboard</a>
    </header>

    <!-- Stats Bar (DYNAMIC - Updates in real-time) -->
    <div class="stats-bar">
        <div class="stat-item">
            <span class="stat-icon">📦</span>
            <span class="stat-label">Levels:</span>
            <span class="stat-value" id="levels-display">0/[TOTAL]</span>
        </div>
        <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-label">XP Earned:</span>
            <span class="stat-value" id="xp-display">0</span>
        </div>
        <div class="stat-item">
            <span class="stat-icon">⏱️</span>
            <span class="stat-label">Time Spent:</span>
            <span class="stat-value" id="time-display">Not started</span>
        </div>
        <div class="stat-item">
            <span class="stat-icon">🕒</span>
            <span class="stat-label">Last Active:</span>
            <span class="stat-value" id="lastactive-display">Never</span>
        </div>
    </div>

    <!-- Content -->
    <div class="content">

        <!-- Introduction -->
        <div class="intro">
            <h2>🚀 [Engaging Introduction Title]</h2>
            <p>
                [Introduction paragraph explaining what students will learn]
            </p>
            <p>
                [Additional context and motivation]
            </p>
        </div>

        <!-- Main Content Sections -->
        <!-- Use section-card for each major section -->

        <!-- Interactive Steps -->
        <div class="section-card">
            <div class="section-header">
                [EMOJI] [Section Title]
            </div>
            <div class="section-content">
                <p style="color: #555; font-size: 1.1em; margin-bottom: 20px;">
                    [Instructions for the steps below]
                </p>

                <ul class="step-list">
                    <!-- Step Template (repeat for each step) -->
                    <li class="step-item" id="step-1">
                        <input type="checkbox" class="step-checkbox" id="checkbox-1" onclick="toggleStep(1)">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>[Step Title]</h3>
                            <p>
                                [Step description and instructions]
                            </p>
                        </div>
                    </li>

                    <!-- Add more steps as needed -->
                </ul>
            </div>
        </div>

        <!-- Completion Section -->
        <div class="next-steps">
            <h2>🎉 Quest Complete!</h2>
            <p>
                <strong>Congratulations!</strong> [Completion message]
            </p>
            <p style="margin-top: 15px;">
                <strong>🎯 Next Quest:</strong> [What to do next]
            </p>
            <div style="text-align: center; margin-top: 25px;">
                <a href="student/dashboard.html" class="download-button" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                    ← Return to Dashboard
                </a>
            </div>
        </div>

    </div>

    <!-- Source Citation (optional) -->
    <div class="source">
        <p>
            <strong>Source:</strong>
            <a href="[SOURCE_URL]" target="_blank">
                [Source Name]
            </a>
        </p>
    </div>

</div>

<script>
    /* COPY JAVASCRIPT FROM SECTION BELOW */
</script>

</body>
</html>
```

---

## Required CSS Styles

Copy this entire `<style>` block into your tutorial:

```css
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        min-height: 100vh;
        padding: 20px;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow: hidden;
    }

    /* Header */
    header {
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
        color: white;
        padding: 30px 40px;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    header .header-content {
        flex: 1;
    }

    header h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    header p {
        font-size: 1.2em;
        opacity: 0.95;
    }

    .back-button {
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid white;
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 1em;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
    }

    .back-button:hover {
        background: white;
        color: #ff6b35;
        transform: translateY(-2px);
    }

    /* XP and Stats Bar */
    .stats-bar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        color: white;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .stat-label {
        font-weight: bold;
        font-size: 0.9em;
        opacity: 0.9;
    }

    .stat-value {
        background: white;
        color: #667eea;
        padding: 5px 15px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 1.1em;
    }

    .stat-icon {
        font-size: 1.3em;
    }

    .rank-badge {
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #333;
        padding: 8px 20px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 1em;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    /* Content */
    .content {
        padding: 40px;
    }

    .intro {
        background: #f8f9fa;
        padding: 30px;
        border-radius: 15px;
        margin-bottom: 30px;
        border-left: 5px solid #ff6b35;
    }

    .intro h2 {
        color: #333;
        margin-bottom: 15px;
        font-size: 1.8em;
    }

    .intro p {
        color: #555;
        line-height: 1.8;
        font-size: 1.1em;
        margin-bottom: 15px;
    }

    /* Section Cards */
    .section-card {
        margin-bottom: 30px;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .section-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        font-size: 1.5em;
        font-weight: bold;
    }

    .section-content {
        background: white;
        padding: 30px;
    }

    /* Step List */
    .step-list {
        list-style: none;
        padding: 0;
        margin-top: 20px;
    }

    .step-item {
        background: #f8f9fa;
        padding: 20px 25px;
        margin-bottom: 15px;
        border-radius: 10px;
        border-left: 5px solid #ff6b35;
        display: flex;
        align-items: flex-start;
        gap: 15px;
        transition: all 0.3s ease;
    }

    .step-item:hover {
        background: #e9ecef;
        transform: translateX(3px);
    }

    .step-item.completed {
        background: #d4edda;
        border-left-color: #28a745;
        opacity: 0.85;
    }

    .step-checkbox {
        width: 24px;
        height: 24px;
        min-width: 24px;
        cursor: pointer;
        margin-top: 5px;
        accent-color: #28a745;
    }

    .step-number {
        background: #ff6b35;
        color: white;
        width: 35px;
        height: 35px;
        min-width: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.1em;
    }

    .step-content {
        flex: 1;
    }

    .step-content h3 {
        color: #333;
        margin-bottom: 10px;
        font-size: 1.2em;
    }

    .step-content p {
        color: #666;
        line-height: 1.8;
        font-size: 1.05em;
        margin-bottom: 10px;
    }

    .step-content ul {
        margin-left: 20px;
        margin-top: 10px;
    }

    .step-content li {
        color: #555;
        line-height: 1.6;
        margin-bottom: 5px;
    }

    /* Download/Action Button */
    .download-button {
        display: inline-flex;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: bold;
        font-size: 1.1em;
        margin: 15px 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .download-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        color: white;
    }

    .download-button img {
        margin-right: 12px;
        width: 26px;
        height: 26px;
    }

    /* Next Steps Section */
    .next-steps {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        padding: 30px;
        border-radius: 15px;
        color: white;
        margin-top: 30px;
    }

    .next-steps h2 {
        font-size: 1.8em;
        margin-bottom: 15px;
    }

    .next-steps p {
        font-size: 1.1em;
        line-height: 1.8;
    }

    /* Source Citation */
    .source {
        text-align: center;
        padding: 30px;
        color: #666;
        font-size: 0.95em;
        background: #f8f9fa;
        border-top: 3px solid #ff6b35;
    }

    .source a {
        color: #ff6b35;
        text-decoration: none;
        font-weight: bold;
    }

    .source a:hover {
        text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 768px) {
        header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }

        header h1 {
            font-size: 1.8em;
        }

        header p {
            font-size: 1em;
        }

        .back-button {
            align-self: flex-start;
        }

        .stats-bar {
            padding: 15px 20px;
            flex-direction: column;
            align-items: flex-start;
        }

        .stat-item {
            width: 100%;
        }

        .content {
            padding: 20px;
        }

        .intro h2 {
            font-size: 1.5em;
        }

        .intro p {
            font-size: 1em;
        }

        .section-header {
            font-size: 1.2em;
            padding: 15px 20px;
        }

        .section-content {
            padding: 20px;
        }
    }
</style>
```

---

## Required JavaScript

Copy this entire `<script>` block into your tutorial:

```javascript
<script>
    // Update last active timestamp if logged in
    if (window.updateLastActive) {
        window.updateLastActive();
    }

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===========================
    // CHECKBOX PROGRESS TRACKING
    // ===========================

    // IMPORTANT: Change this storage key for each tutorial
    const STORAGE_KEY = '[tutorialName]Progress';  // e.g., 'installStudioProgress'

    // Load saved progress on page load
    window.addEventListener('DOMContentLoaded', () => {
        loadProgress();
    });

    // Toggle step completion
    function toggleStep(stepNumber) {
        const checkbox = document.getElementById(`checkbox-${stepNumber}`);
        const stepItem = document.getElementById(`step-${stepNumber}`);

        if (checkbox.checked) {
            stepItem.classList.add('completed');
        } else {
            stepItem.classList.remove('completed');
        }

        // Save progress
        saveProgress();
    }

    // Save progress to localStorage
    function saveProgress() {
        const progress = {};
        // Update the loop limit to match your number of steps
        for (let i = 1; i <= 5; i++) {  // Change 5 to your total step count
            const checkbox = document.getElementById(`checkbox-${i}`);
            if (checkbox) {
                progress[`step-${i}`] = checkbox.checked;
            }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }

    // Load progress from localStorage
    function loadProgress() {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (!savedProgress) return;

        try {
            const progress = JSON.parse(savedProgress);

            // Update the loop limit to match your number of steps
            for (let i = 1; i <= 5; i++) {  // Change 5 to your total step count
                const stepKey = `step-${i}`;
                if (progress[stepKey]) {
                    const checkbox = document.getElementById(`checkbox-${i}`);
                    const stepItem = document.getElementById(`step-${i}`);

                    if (checkbox && stepItem) {
                        checkbox.checked = true;
                        stepItem.classList.add('completed');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }
</script>
```

---

## Step-by-Step Creation Guide

### 1. Create New HTML File

```bash
# Create file in project root
touch /Users/chrislee/Project/Web_Service/[tutorial-name].html
```

### 2. Copy Base Template

Copy the complete HTML template from the "Complete HTML Template" section above.

### 3. Customize Header & Stats Bar

Replace placeholders:
- `[Tutorial Title]` → Your tutorial title
- `[EMOJI]` → Choose an appropriate emoji (📦, 🎨, 🔧, etc.)
- `[Subtitle]` → Short description
- `[Quest Name]` → e.g., "Install Studio", "Create UI", etc.
- `~[X] mins` → Estimated completion time
- `[Quest Level]` → e.g., "Beginner Quest", "Intermediate Quest", "Expert Quest"

**Quest Level Badge Recommendations:**
- 🏁 Beginner Quest (for introductory tutorials)
- ⭐ Intermediate Quest (for moderate difficulty)
- 🏆 Expert Quest (for advanced topics)

### 4. Write Introduction Section

Update the intro section with:
- Engaging title with rocket emoji 🚀
- Brief explanation of what students will learn
- Motivation and context

### 5. Create Step-by-Step Instructions

For each step:

```html
<li class="step-item" id="step-[N]">
    <input type="checkbox" class="step-checkbox" id="checkbox-[N]" onclick="toggleStep([N])">
    <div class="step-number">[N]</div>
    <div class="step-content">
        <h3>[Step Title]</h3>
        <p>[Step Description]</p>
        <!-- Optional: Add images, code blocks, or sub-lists -->
    </div>
</li>
```

**Important:** Update `[N]` with the step number (1, 2, 3, etc.)

### 6. Update JavaScript Step Count

In the JavaScript section, update these two locations:

```javascript
const STORAGE_KEY = '[yourTutorialName]Progress';  // Line ~660

// Update loop limit to match total steps
for (let i = 1; i <= [TOTAL_STEPS]; i++) {  // Lines ~685 and ~702
```

### 7. Customize Completion Section

Update the "Quest Complete!" section with:
- Congratulations message
- Summary of what was accomplished
- What quest/tutorial comes next

### 8. Test the Tutorial

1. Open in browser: `http://localhost:8080/[tutorial-name].html`
2. Test checkboxes (should save on click)
3. Refresh page (checkboxes should restore)
4. Test on mobile (responsive design)
5. Clear browser localStorage to reset progress

---

## Common Components

### Adding Images

```html
<div class="step-content">
    <h3>Step Title</h3>
    <p>Description</p>
    <img src="path/to/image.png"
         alt="Description"
         style="max-width: 100%; border-radius: 10px; margin: 15px 0;">
</div>
```

### Adding Code Snippets

```html
<span class="step-code">code_snippet_here</span>
```

Add this CSS for code styling:

```css
.step-code {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 8px 12px;
    border-radius: 5px;
    font-family: 'Courier New', monospace;
    font-size: 0.95em;
    display: inline-block;
    margin: 5px 0;
}
```

### Adding Download/Action Buttons

```html
<a href="[URL]" target="_blank" class="download-button">
    <img alt="Icon" src="[ICON_URL]">
    [Button Text]
</a>
```

### Adding Subsections

```html
<div class="section-card">
    <div class="section-header">
        [EMOJI] [Section Title]
    </div>
    <div class="section-content">
        <!-- Content here -->
    </div>
</div>
```

---

## Color Scheme Reference

| Element | Colors |
|---------|--------|
| Header | Orange gradient: `#ff6b35` → `#f7931e` |
| Stats Bar | Purple gradient: `#667eea` → `#764ba2` |
| Section Headers | Purple gradient: `#667eea` → `#764ba2` |
| Step Border | Orange: `#ff6b35` |
| Completed Step | Green: `#d4edda` (background), `#28a745` (border) |
| Next Steps | Green gradient: `#28a745` → `#20c997` |
| Rank Badge | Gold gradient: `#ffd700` → `#ffed4e` |

---

## Emoji Recommendations

### Quest Types
- 🏁 Beginner
- ⭐ Intermediate
- 🏆 Expert
- 🎯 Practice

### Tutorial Topics
- 📦 Installation/Setup
- 🎨 Design/UI
- 🔧 Tools
- 💻 Coding
- 🎮 Game Development
- 🌟 Special/Featured
- 🚀 Getting Started
- 📊 Data/Analytics
- 🔒 Security

### Icons
- 🎯 Quest/Goal
- ⏱️ Time
- ✅ Complete
- 💡 Tip
- ⚠️ Warning
- 📝 Note

---

## localStorage Keys

Each tutorial should have a unique storage key:

| Tutorial | Storage Key |
|----------|-------------|
| Install Studio | `installStudioProgress` |
| Create UI | `createUIProgress` |
| Build Game | `buildGameProgress` |
| [Your Tutorial] | `[tutorialName]Progress` |

**Format:** `[camelCaseName]Progress`

---

## Integration with Backend (Optional)

To track tutorial completion in the database:

```javascript
// Add after saveProgress() function
async function reportCompletion() {
    const session = window.getSession ? window.getSession() : null;
    if (!session) return;

    try {
        await fetch('http://localhost:3300/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: session.id,
                event_type: 'tutorial_completed',
                level: 1,
                data: {
                    tutorial: '[tutorial-name]',
                    completed_at: new Date().toISOString()
                }
            })
        });
    } catch (error) {
        console.error('Failed to report completion:', error);
    }
}
```

Call this function when all steps are completed.

---

## File Naming Convention

Use lowercase with hyphens:
- ✅ `install-roblox-studio.html`
- ✅ `create-ui-layout.html`
- ✅ `build-first-game.html`
- ❌ `InstallRobloxStudio.html`
- ❌ `create_ui_layout.html`

---

## Checklist for New Tutorial

- [ ] Created HTML file with proper naming
- [ ] Copied base template
- [ ] Updated header title and subtitle
- [ ] Customized stats bar (quest name, time, level)
- [ ] Wrote introduction section
- [ ] Added all step-by-step instructions
- [ ] Added checkboxes to each step
- [ ] Updated JavaScript step count
- [ ] Set unique localStorage key
- [ ] Wrote completion message
- [ ] Added source citation (if applicable)
- [ ] Tested checkbox functionality
- [ ] Tested progress saving/loading
- [ ] Tested responsive design on mobile
- [ ] Verified all links work
- [ ] Checked for typos and grammar

---

## Example Tutorials

### Reference Files
- ✅ `/Users/chrislee/Project/Web_Service/install_roblox_studio.html` - Complete example
- ✅ `/Users/chrislee/Project/Web_Service/versions/v9_game_style.html` - Advanced with quizzes

---

## Support & Resources

### Color Tools
- [Color Picker](https://htmlcolorcodes.com/color-picker/)
- [Gradient Generator](https://cssgradient.io/)

### Emoji Resources
- [Emojipedia](https://emojipedia.org/)
- [Unicode Emoji List](https://unicode.org/emoji/charts/full-emoji-list.html)

### Testing
- Test on Chrome, Firefox, Safari
- Test on mobile devices (iOS/Android)
- Clear localStorage: `localStorage.clear()` in browser console

---

## 🚀 Backend Progress Tracking (NEW!)

### Overview

As of version 2.0, tutorials now support full backend API integration for tracking student progress in the database.

### Critical Bug Fix: Reset Progress Negative Values

**Problem:** When admin resets student progress, checkboxes remain checked but `completedSteps = 0`, causing negative values when unchecking.

**Required Fixes:**

1. **In `loadBackendProgress()` - Uncheck ALL boxes first:**
```javascript
// Reset ALL checkboxes before loading backend data
for (let i = 1; i <= TOTAL_STEPS; i++) {
    const checkbox = document.getElementById(`checkbox-${i}`);
    const stepItem = document.getElementById(`step-${i}`);
    if (checkbox) {
        checkbox.checked = false;
        stepItem.classList.remove('completed');
    }
}
```

2. **In `toggleStep()` - Prevent negative values:**
```javascript
} else {
    stepItem.classList.remove('completed');
    completedSteps = Math.max(0, completedSteps - 1);  // Never go below 0
    totalXP = completedSteps * XP_PER_STEP;
}
```

See `install_roblox_studio.html` for complete implementation example.

---

## Troubleshooting

### Negative XP/Levels after Reset Progress
- **Cause:** UI checkboxes not synced with backend after admin reset
- **Fix:** Implement both fixes above in `loadBackendProgress()` and `toggleStep()`
- **Test:** Have admin reset progress → Refresh tutorial page → Should show 0/X

### Checkboxes not saving
- Verify unique `STORAGE_KEY` in JavaScript
- Check browser console for errors
- Ensure step IDs match: `step-1`, `checkbox-1`

### Progress not loading
- Verify `loadProgress()` is called on `DOMContentLoaded`
- Check localStorage in browser DevTools (Application → Local Storage)
- Verify JSON format in localStorage

### Styling issues
- Clear browser cache with hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Check for missing closing tags
- Verify CSS classes match template

### Mobile responsive issues
- Test viewport meta tag is present
- Check media query breakpoint (768px)
- Verify padding/margins on small screens

---

## Version History

- **v2.0** (2025-01-23) - Backend Integration & Bug Fixes
  - ✅ Backend API progress tracking
  - ✅ Real-time XP and level updates
  - ✅ Student session management
  - ✅ Offline queue for failed requests
  - ✅ Progress restoration from database
  - ✅ **FIX:** Reset Progress negative values bug
  - ✅ **FIX:** Prevent negative XP/levels
  - ✅ Dynamic stats bar (4 stats)
  - ✅ Time tracking

- **v1.0** (2025-01-22) - Initial template based on install_roblox_studio.html
  - Interactive checkboxes
  - Progress tracking with localStorage
  - Game-style stats bar
  - Responsive design

---

## License & Credits

Template created for Roblox Studio Academy project.
Based on v9_game_style.html and install_roblox_studio.html.

---

**Ready to create your first tutorial?** Follow the checklist above and use `install_roblox_studio.html` as your reference!
