# Tutorial Page Template Guide

**Version 3.1** | Last Updated: 2025-01-24

A comprehensive guide for creating interactive, gamified tutorial pages for the Roblox Studio Academy platform with full backend integration and progress tracking.

---

## 📖 Table of Contents

### PART 1: GETTING STARTED
- [Overview & Features](#overview--features)
- [What's New (Version History)](#version-history)
- [File Structure](#file-structure)
- [Quick Start Guide](#quick-start-guide)

### PART 2: CREATING A BASIC TUTORIAL
- [Complete HTML Template](#complete-html-template)
- [Required CSS Styles](#required-css-styles)
- [Required JavaScript](#required-javascript)
- [Step-by-Step Creation Guide](#step-by-step-creation-guide)
- [Common Components](#common-components)
- [Checklist for New Tutorial](#checklist-for-new-tutorial)

### PART 3: STYLING & CUSTOMIZATION
- [Color Scheme Reference](#color-scheme-reference)
- [Emoji Recommendations](#emoji-recommendations)
- [File Naming Convention](#file-naming-convention)

### PART 4: BACKEND INTEGRATION (CRITICAL!)
- [⚠️ Course Progress Integration Patterns](#-course-progress-integration-patterns-important)
  - [Pattern 1: Backend XP Calculation](#pattern-1-backend-xp-calculation)
  - [Pattern 2: Dashboard Course Display](#pattern-2-dashboard-course-display-logic)
  - [Pattern 3: Completion Event Tracking](#pattern-3-completion-event-tracking)
  - [Pattern 4: Backend Quest Recognition](#pattern-4-backend-quest-completion-recognition)
  - [Pattern 5: Course ID Assignment](#pattern-5-course-id-assignment)
- [Complete Integration Checklist](#complete-integration-checklist)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)
- [Debugging Progress Issues](#debugging-progress-issues)
- [Backend Progress Tracking](#-backend-progress-tracking-new)
- [Critical Bug Fixes](#critical-bug-fix-reset-progress-negative-values)

### PART 4.5: BADGE & RANK SYSTEM
- [Badge & Rank System Overview](#-badge--rank-system-v20)
- [Badge System](#badge-system)
- [Rank System (30 Levels)](#rank-system-30-levels)
- [Backend Calculation](#backend-calculation-badgesranks)
- [Frontend Display](#frontend-display-badgesranks)
- [Dashboard Integration](#dashboard-integration-badgesranks)
- [Migration from XP-Based System](#migration-from-xp-based-system)

### PART 5: UNIVERSAL COURSE MODEL (ADVANCED)
- [Universal Course Model Overview](#-universal-course-model-v30)
- [Database Structure](#database-structure)
- [Universal Event Types](#universal-event-types)
- [Universal Frontend Tracking](#universal-frontend-tracking-pattern)
- [Universal Backend Calculation](#universal-backend-calculation)
- [Universal Dashboard Rendering](#universal-dashboard-rendering)
- [Course Type Examples (6 Types)](#course-type-examples)
- [Migration Guide](#migration-guide)

### PART 6: REFERENCE & SUPPORT
- [localStorage Keys](#localstorage-keys)
- [Troubleshooting](#troubleshooting)
- [Example Tutorials](#example-tutorials)
- [Support & Resources](#support--resources)

---

## Overview & Features

### What This Guide Provides

This guide provides **everything you need** to create interactive tutorial pages for the Roblox Studio Academy platform. Whether you're creating a simple step-by-step guide or a complex multi-level course, this template has you covered.

### Core Features

**Frontend Features:**
- ✅ Game-style header with dynamic stats bar
- ✅ Interactive checkboxes for step tracking
- ✅ Progress saving to localStorage (backup)
- ✅ Responsive design for mobile/tablet/desktop
- ✅ Consistent styling with existing tutorials
- ✅ Complete Quest button with confetti celebration
- ✅ Real-time progress updates

**Backend Integration:**
- ✅ **Backend API integration** for progress tracking
- ✅ **Real-time XP and level updates**
- ✅ **Offline queue** for failed requests
- ✅ **Student session management**
- ✅ **Progress restore** from backend database
- ✅ **Dashboard integration** (course cards show progress)
- ✅ **Admin tools** (view/reset student progress)

**Advanced Features:**
- ✅ **Universal Course Model** - One system for all course types
- ✅ **Multiple course types** - Quiz, Step, Activity, Mixed, Video, Project
- ✅ **Course completion tracking** - 100% progress recognition
- ✅ **Role-based access control** - Student/Teacher/Admin permissions

### Who Should Use This Guide

- **Developers** - Creating new tutorial pages
- **Educators** - Designing course content
- **Maintainers** - Fixing bugs or adding features
- **Contributors** - Understanding the system architecture

---

## Quick Start Guide

### Creating Your First Tutorial (5 Minutes)

1. **Copy the template** - Use `install_roblox_studio.html` as starting point
2. **Update content** - Replace title, steps, and images
3. **Set unique IDs** - Change `STORAGE_KEY` and `COURSE_LEVEL`
4. **Test locally** - Open in browser, complete steps
5. **Add to database** - Insert course entry in `courses` table
6. **Test dashboard** - Verify progress displays correctly

**→ For detailed instructions, see [Step-by-Step Creation Guide](#step-by-step-creation-guide)**

### Important: Backend Integration Required!

⚠️ **READ THIS FIRST:** If you skip the backend integration patterns, your course progress **will not display** on the student dashboard!

**Critical sections to read:**
1. [Course Progress Integration Patterns](#-course-progress-integration-patterns-important) - **5 required patterns**
2. [Complete Integration Checklist](#complete-integration-checklist) - **Must complete all items**
3. [Common Mistakes to Avoid](#common-mistakes-to-avoid) - **Avoid these 4 mistakes**

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

# ═══════════════════════════════════════════════════════════════════════════
# PART 2: CREATING A BASIC TUTORIAL
# ═══════════════════════════════════════════════════════════════════════════

This section covers everything you need to create a simple, functional tutorial page with interactive checkboxes and progress tracking.

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

# ═══════════════════════════════════════════════════════════════════════════
# PART 3: STYLING & CUSTOMIZATION
# ═══════════════════════════════════════════════════════════════════════════

Customize the look and feel of your tutorial with colors, emojis, and naming conventions.

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

# ═══════════════════════════════════════════════════════════════════════════
# PART 4: BACKEND INTEGRATION (CRITICAL!)
# ═══════════════════════════════════════════════════════════════════════════

⚠️ **REQUIRED READING** - These patterns ensure your course progress displays correctly on the dashboard!

---

## 🔧 Course Progress Integration Patterns (IMPORTANT!)

### Overview

These patterns ensure your tutorial progress displays correctly on the student dashboard and works seamlessly with the backend API.

### Pattern 1: Backend XP Calculation

**Problem:** Dashboard shows 0 XP for step-based courses even though students complete steps.

**Root Cause:** Backend only counts quiz XP, ignoring step XP.

**Required Fix in `backend/routes.js`:**

```javascript
function calculateStudentStats(events) {
  // Count steps completed
  const stepsCompleted = events.filter(e => e.event_type === 'step_checked').length;

  // Count quiz answers
  const quizEvents = events.filter(e => e.event_type === 'quiz_answered');
  const correctQuizzes = quizEvents.filter(e => {
    const data = JSON.parse(e.data || '{}');
    return data.correct === true;
  }).length;

  // ✅ CORRECT: Calculate XP from BOTH quizzes AND steps
  const quizXP = correctQuizzes * 100;
  const stepXP = stepsCompleted * 20;
  const totalXP = quizXP + stepXP;

  // ❌ WRONG: Only count quiz XP
  // const totalXP = correctQuizzes * 100;

  return {
    // ...
    total_xp: totalXP
  };
}
```

**Impact:** Step-based courses (like Install Studio) now show correct XP on dashboard.

---

### Pattern 2: Dashboard Course Display Logic

**Problem:** Dashboard only shows progress for Course ID 1 (Studio Basics), not other courses.

**Root Cause:** Dashboard has hardcoded check for `course.id === 1`.

**Required Fix in `student/js/dashboard.js`:**

```javascript
function renderCourses() {
  container.innerHTML = availableCourses.map(course => {
    let courseProgress = 0;
    let xpEarned = 0;

    // ✅ CORRECT: Include all course IDs
    if ((course.id === 1 || course.id === 4) && studentProgress) {
      courseProgress = summary.progress_percentage || 0;
      xpEarned = summary.total_xp || 0;
    }

    // ❌ WRONG: Only Course ID 1
    // if (course.id === 1 && studentProgress) {

    // ...render course card with progress
  });
}
```

**Better Solution (Universal):** Use course metadata instead of hardcoded IDs:

```javascript
// Check if course has any progress events
const hasCourseProgress = studentProgress.all_events?.some(e => {
  try {
    const data = JSON.parse(e.data || '{}');
    return data.course_id === course.id;
  } catch {
    return false;
  }
});

if (hasCourseProgress && studentProgress) {
  // Calculate progress for this course
}
```

**Impact:** All courses now display progress on dashboard, not just Course ID 1.

---

### Pattern 3: Completion Event Tracking

**Problem:** "Complete Quest" button doesn't trigger same progression as quiz completion.

**Root Cause:** Missing `level_unlocked` event when quest completes.

**⚠️ CRITICAL FIX (2025-10-26):** The `showCompletion()` function must also track `quest_completed` event!

**Required Implementation in Tutorial HTML:**

```javascript
function completeQuest() {
  if (completedSteps !== TOTAL_STEPS) {
    alert('Please complete all steps first!');
    return;
  }

  // ✅ Track BOTH events (like Studio Basics does)

  // 1. Track quest completion (for record keeping)
  trackProgress('quest_completed', COURSE_LEVEL, {
    total_steps: TOTAL_STEPS,
    total_xp: totalXP,
    completion_time: new Date().toISOString()
  });

  // 2. Track level unlock (for backend stats calculation)
  trackProgress('level_unlocked', TOTAL_STEPS, {
    course_id: 4,  // Your course ID
    level: TOTAL_STEPS,
    xp_earned: totalXP
  });

  // Show completion UI
  showCompletionSection();
}

// ⚠️ CRITICAL: Also track in showCompletion() function!
function showCompletion() {
  // TRACK QUEST COMPLETION EVENT (CRITICAL FOR 100% PROGRESS!)
  trackProgress('quest_completed', totalLevels, {
    total_xp: totalXP,
    completed_levels: completedLevels,
    timestamp: new Date().toISOString()
  });

  // ... rest of showCompletion() code ...
  const completionMsg = document.getElementById('completion-message');
  completionMsg.style.display = 'block';
  // ... badge display logic ...
}
```

**Why Both Events?**
- `quest_completed` - Records the completion event with metadata
- `level_unlocked` - Backend recognizes this for progress calculation

**Why Track in showCompletion() Too?**
- Ensures `quest_completed` event is ALWAYS created when completion screen shows
- Without this, students who answer final quiz but don't click button will show 83% instead of 100%
- Dashboard requires `quest_completed` event to display 100% progress (see `student/js/dashboard.js:296-307`)

**Impact:** Complete Quest button now works like Studio Basics quiz completion, and dashboard always shows 100% progress after full course completion.

---

### Pattern 4: Backend Quest Completion Recognition

**Problem:** Backend doesn't recognize `quest_completed` events for 100% progress.

**Root Cause:** Backend only calculates progress from `level_unlocked` events.

**Required Fix in `backend/routes.js`:**

```javascript
function calculateStudentStats(events) {
  // ... calculate XP and levels ...

  // ✅ Check for quest completion
  const questCompleted = events.some(e => e.event_type === 'quest_completed');

  // Calculate progress percentage
  let progressPercentage = Math.round((currentLevel / 6) * 100);

  // ✅ Override to 100% if quest completed
  if (questCompleted) {
    progressPercentage = 100;
  }

  return {
    current_level: currentLevel,
    progress_percentage: progressPercentage,
    total_xp: totalXP,
    // ...
  };
}
```

**Impact:** Courses show 100% completion when quest finished.

---

### Pattern 5: Course ID Assignment

**Best Practice:** Use `COURSE_LEVEL` constant to distinguish courses.

```javascript
// In install_roblox_studio.html
const COURSE_LEVEL = 0;  // Unique identifier for Install Studio

// In versions/v9_game_style.html (Studio Basics)
// Uses levels 1-6 (different from Install Studio)

// Why different levels?
// - Prevents event conflicts between courses
// - Backend can distinguish which course events belong to
// - Allows course-specific progress calculation
```

**Course ID Mapping:**
- Install Studio: `level: 0`, `course_id: 4`
- Studio Basics: `level: 1-6`, `course_id: 1`
- Future courses: Use unique level ranges or course_id values

---

### Complete Integration Checklist

When creating a new tutorial, ensure:

**Frontend (Tutorial HTML):**
- [ ] Track `session_start` when page loads
- [ ] Track `step_checked` or `quiz_answered` for each unit
- [ ] Track `level_unlocked` when major milestone reached
- [ ] Track `quest_completed` or `course_completed` when finished
- [ ] Use unique `COURSE_LEVEL` or `course_id`
- [ ] Include both completion events (quest_completed + level_unlocked)

**Backend (`routes.js`):**
- [ ] `calculateStudentStats()` counts ALL XP sources (quiz + step)
- [ ] Check for `quest_completed` events → set progress to 100%
- [ ] Check for `course_completed` events if using universal model
- [ ] Return `total_xp`, `progress_percentage`, `steps_completed`

**Dashboard (`student/js/dashboard.js`):**
- [ ] Include your course ID in the progress check
- [ ] Or use universal course detection logic
- [ ] Verify course card displays: XP, progress %, time spent
- [ ] Test "View Progress" button navigation

**Testing:**
- [ ] Complete tutorial as student → Check XP calculation
- [ ] Click "Complete Quest" → Check progress shows 100%
- [ ] Refresh dashboard → Check course card shows progress
- [ ] Admin resets progress → Check page shows 0/X correctly

---

### Common Mistakes to Avoid

**❌ Mistake 1: Only counting quiz XP**
```javascript
const totalXP = correctQuizzes * 100;  // Missing step XP!
```

**✅ Fix:**
```javascript
const quizXP = correctQuizzes * 100;
const stepXP = stepsCompleted * 20;
const totalXP = quizXP + stepXP;
```

---

**❌ Mistake 2: Hardcoding course ID in dashboard**
```javascript
if (course.id === 1 && studentProgress) {  // Only works for one course!
```

**✅ Fix:**
```javascript
if ((course.id === 1 || course.id === 4) && studentProgress) {
// Or better: Use universal detection
```

---

**❌ Mistake 3: Only tracking quest_completed**
```javascript
trackProgress('quest_completed', 0, { /* ... */ });
// Missing level_unlocked event!
```

**✅ Fix:**
```javascript
trackProgress('quest_completed', 0, { /* ... */ });
trackProgress('level_unlocked', TOTAL_STEPS, {
  course_id: 4,
  level: TOTAL_STEPS,
  xp_earned: totalXP
});
```

---

**❌ Mistake 4: Not checking quest_completed in backend**
```javascript
// Backend doesn't know about quest_completed event
const progressPercentage = Math.round((currentLevel / 6) * 100);
```

**✅ Fix:**
```javascript
const questCompleted = events.some(e => e.event_type === 'quest_completed');
let progressPercentage = Math.round((currentLevel / 6) * 100);
if (questCompleted) {
  progressPercentage = 100;
}
```

---

### Debugging Progress Issues

**Dashboard shows 0 XP:**
1. Check backend `calculateStudentStats()` includes step XP calculation
2. Verify `step_checked` events are being tracked
3. Test API: `curl http://localhost:3300/api/students/:id | grep total_xp`

**Dashboard shows 0% progress:**
1. Check backend recognizes your event type (`quest_completed`, `course_completed`)
2. Verify `level_unlocked` events are tracked
3. Check progress calculation logic in `calculateStudentStats()`

**Course card not showing progress:**
1. Check `renderCourses()` includes your course ID
2. Verify `studentProgress` object has data
3. Check browser console for JavaScript errors

**Complete Quest button doesn't work:**
1. Verify both events tracked (`quest_completed` + `level_unlocked`)
2. Check backend receives events: Check database `progress_events` table
3. Test API response includes `progress_percentage: 100`

---

# ═══════════════════════════════════════════════════════════════════════════
# PART 4.5: BADGE & RANK SYSTEM
# ═══════════════════════════════════════════════════════════════════════════

Course-based progression system with badges and ranks that incentivize completion across all courses.

---

## 🏆 Badge & Rank System (v2.0)

### Overview

The Badge & Rank System provides a **simple, course-based progression** that incentivizes students to complete multiple courses across the platform.

**New System (v2.0):**
- ✅ **1 Course Completed = 1 Badge + 1 Rank Level**
- ✅ **Total Badges: 30** (one per course completion)
- ✅ **Total Ranks: 30 levels** with unique names and icons
- ✅ **XP still tracked** but only for reference (doesn't affect badges/rank)
- ✅ **Simple calculation** - Just count completed courses
- ✅ **Clear progression** - Students understand exactly what to do

**Why This System?**

The old XP-based system had issues:
- ❌ Confusing: Students didn't understand why they had different XP across courses
- ❌ Complex: Total XP didn't sum correctly across multiple courses
- ❌ Inconsistent: Different XP rates per course type made comparison difficult

**Benefits of New System:**
- ✅ **Clear Goal:** Complete courses to earn badges and rank up
- ✅ **Consistent:** Every course = 1 badge = 1 rank level
- ✅ **Motivating:** 30 unique rank names provide progression milestones
- ✅ **Simple:** Easy to calculate and display

---

## Badge System

### How It Works

**Badge Calculation:**
```
Total Badges = Number of Courses Completed
```

**Course Completion Definition:**
A course is considered "completed" when the student triggers a `course_completed` event.

**Badge Display:**
- Format: `X/30` (e.g., "2/30 Badges")
- Each badge represents one completed course
- Maximum: 30 badges (assumes 30 courses in curriculum)

**Example:**
- Student completes "Install Roblox Studio" → **1 Badge**
- Student completes "Studio Basics" → **2 Badges**
- Student completes "Build First Part" → **3 Badges**
- ...and so on up to 30 courses

---

## Rank System (30 Levels)

### Complete Rank Hierarchy

Each rank level corresponds to the number of courses completed:

| Level | Courses Completed | Rank Name | Icon |
|-------|-------------------|-----------|------|
| 0 | 0 | Beginner | 🎯 |
| 1 | 1 | Apprentice | 📚 |
| 2 | 2 | Student | ✏️ |
| 3 | 3 | Learner | 📖 |
| 4 | 4 | Scholar | 🎓 |
| 5 | 5 | Intermediate | ⭐ |
| 6 | 6 | Practitioner | 🔧 |
| 7 | 7 | Developer | 💻 |
| 8 | 8 | Builder | 🏗️ |
| 9 | 9 | Creator | 🎨 |
| 10 | 10 | Advanced | 🚀 |
| 11 | 11 | Skilled | 💪 |
| 12 | 12 | Professional | 💼 |
| 13 | 13 | Specialist | 🎯 |
| 14 | 14 | Expert | ⚡ |
| 15 | 15 | Master | 🏆 |
| 16 | 16 | Veteran | 🛡️ |
| 17 | 17 | Elite | ⭐⭐ |
| 18 | 18 | Champion | 🏅 |
| 19 | 19 | Hero | 🦸 |
| 20 | 20 | Legend | 👑 |
| 21 | 21 | Grandmaster | 🎖️ |
| 22 | 22 | Sage | 🧙 |
| 23 | 23 | Guru | 🕉️ |
| 24 | 24 | Virtuoso | 🎼 |
| 25 | 25 | Prodigy | 🌟 |
| 26 | 26 | Genius | 🧠 |
| 27 | 27 | Titan | 💎 |
| 28 | 28 | Deity | ⚡⚡ |
| 29 | 29 | Immortal | 🔥 |
| 30 | 30 | Transcendent | ✨ |

### Rank Progression Example

**Student Journey:**
1. **Start:** Rank = Beginner 🎯 (0 courses)
2. **Complete Install Studio:** Rank = Apprentice 📚 (1 course)
3. **Complete Studio Basics:** Rank = Student ✏️ (2 courses)
4. **Complete 3rd course:** Rank = Learner 📖 (3 courses)
5. **...continue completing courses...**
6. **Complete all 30 courses:** Rank = Transcendent ✨ (30 courses)

---

## Backend Calculation (Badges/Ranks)

### Function: calculateBadgesAndRank()

Add this new function to `backend/routes.js`:

```javascript
/**
 * Calculate badges and rank based on completed courses
 *
 * @param {Array} events - All progress events for a student
 * @returns {Object} { badges, rank, rankName, rankIcon }
 */
function calculateBadgesAndRank(events) {
  if (!events || events.length === 0) {
    return {
      badges: 0,
      rank: 0,
      rankName: 'Beginner',
      rankIcon: '🎯'
    };
  }

  // Find unique completed courses
  const completedCourses = new Set();

  events.forEach(event => {
    // Accept both 'course_completed' and 'quest_completed' for backward compatibility
    if (event.event_type === 'course_completed' || event.event_type === 'quest_completed') {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Try to get course_id from data first, then fall back to event.course_id
        const courseId = data.course_id || event.course_id;

        if (courseId) {
          completedCourses.add(courseId);
        }
      } catch (error) {
        console.error('Error parsing completion event:', error);
      }
    }
  });

  const coursesCompleted = completedCourses.size;

  // Get rank info
  const rankInfo = getRankInfo(coursesCompleted);

  return {
    badges: coursesCompleted,
    rank: coursesCompleted,
    rankName: rankInfo.name,
    rankIcon: rankInfo.icon,
    coursesCompleted: coursesCompleted
  };
}

/**
 * Get rank information for a given number of completed courses
 *
 * @param {number} coursesCompleted - Number of courses completed (0-30)
 * @returns {Object} { level, name, icon }
 */
function getRankInfo(coursesCompleted) {
  const ranks = [
    { level: 0, name: 'Beginner', icon: '🎯' },
    { level: 1, name: 'Apprentice', icon: '📚' },
    { level: 2, name: 'Student', icon: '✏️' },
    { level: 3, name: 'Learner', icon: '📖' },
    { level: 4, name: 'Scholar', icon: '🎓' },
    { level: 5, name: 'Intermediate', icon: '⭐' },
    { level: 6, name: 'Practitioner', icon: '🔧' },
    { level: 7, name: 'Developer', icon: '💻' },
    { level: 8, name: 'Builder', icon: '🏗️' },
    { level: 9, name: 'Creator', icon: '🎨' },
    { level: 10, name: 'Advanced', icon: '🚀' },
    { level: 11, name: 'Skilled', icon: '💪' },
    { level: 12, name: 'Professional', icon: '💼' },
    { level: 13, name: 'Specialist', icon: '🎯' },
    { level: 14, name: 'Expert', icon: '⚡' },
    { level: 15, name: 'Master', icon: '🏆' },
    { level: 16, name: 'Veteran', icon: '🛡️' },
    { level: 17, name: 'Elite', icon: '⭐⭐' },
    { level: 18, name: 'Champion', icon: '🏅' },
    { level: 19, name: 'Hero', icon: '🦸' },
    { level: 20, name: 'Legend', icon: '👑' },
    { level: 21, name: 'Grandmaster', icon: '🎖️' },
    { level: 22, name: 'Sage', icon: '🧙' },
    { level: 23, name: 'Guru', icon: '🕉️' },
    { level: 24, name: 'Virtuoso', icon: '🎼' },
    { level: 25, name: 'Prodigy', icon: '🌟' },
    { level: 26, name: 'Genius', icon: '🧠' },
    { level: 27, name: 'Titan', icon: '💎' },
    { level: 28, name: 'Deity', icon: '⚡⚡' },
    { level: 29, name: 'Immortal', icon: '🔥' },
    { level: 30, name: 'Transcendent', icon: '✨' }
  ];

  // Cap at level 30
  const level = Math.min(coursesCompleted, 30);
  return ranks[level];
}

// Export functions
module.exports = {
  calculateBadgesAndRank,
  getRankInfo
};
```

### Integration with calculateStudentStats()

Update your existing `calculateStudentStats()` function to include badge/rank data:

```javascript
function calculateStudentStats(events) {
  // ... existing XP/level calculation ...

  // NEW: Calculate badges and rank
  const badgeRankData = calculateBadgesAndRank(events);

  return {
    // Existing fields
    current_level: currentLevel,
    progress_percentage: progressPercentage,
    total_xp: totalXP,
    steps_completed: stepsCompleted,
    quiz_score: quizScore,

    // NEW: Badge and rank fields
    badges: badgeRankData.badges,
    rank: badgeRankData.rank,
    rankName: badgeRankData.rankName,
    rankIcon: badgeRankData.rankIcon,
    coursesCompleted: badgeRankData.coursesCompleted
  };
}
```

### API Response Example

After implementation, `/api/students/:id` should return:

```json
{
  "student": { "id": 1, "name": "Alice", "..." },
  "summary": {
    "current_level": 5,
    "progress_percentage": 100,
    "total_xp": 100,
    "badges": 2,
    "rank": 2,
    "rankName": "Student",
    "rankIcon": "✏️",
    "coursesCompleted": 2
  },
  "all_events": [...]
}
```

---

## Frontend Display (Badges/Ranks)

### Dashboard Summary Section

Update `student/js/dashboard.js` to display badges and rank:

```javascript
function updateStudentSummary(data) {
  const summary = data.summary || {};

  // Update header stats (keep existing XP display)
  document.getElementById('userLevel').textContent = `Level ${summary.current_level || 0}`;
  document.getElementById('userXP').textContent = `${summary.total_xp || 0} XP`;

  // Update overall progress
  const progressPercent = summary.progress_percentage || 0;
  document.getElementById('overallProgressText').textContent = `${progressPercent}%`;
  document.getElementById('overallProgressBar').style.width = `${progressPercent}%`;
  document.getElementById('overallProgressBar').textContent = `${progressPercent}%`;

  // NEW: Update badges (1 badge per course)
  const badges = summary.badges || 0;
  document.getElementById('badgesEarned').textContent = `${badges}/30`;

  // NEW: Update rank
  const rankName = summary.rankName || 'Beginner';
  const rankIcon = summary.rankIcon || '🎯';
  document.getElementById('currentRank').textContent = `${rankIcon} ${rankName}`;

  // Keep existing class info
  document.getElementById('classCodeDisplay').textContent = currentStudent.class_code || 'None';
  document.getElementById('emailDisplay').textContent = currentStudent.email || 'No email';
  document.getElementById('lastActiveDisplay').textContent =
    formatRelativeTime(currentStudent.last_active);
}
```

### Dashboard HTML Updates

Update `student/dashboard.html` badge and rank display:

```html
<!-- Stat Badges Row -->
<div class="d-flex justify-content-end gap-3">
  <!-- Total XP Badge (for reference) -->
  <div class="stat-badge">
    <div class="stat-icon">💎</div>
    <div class="stat-info">
      <div class="stat-label">Total XP</div>
      <div class="stat-value" id="totalXPBadge">0</div>
    </div>
  </div>

  <!-- Badges Badge (NEW: Based on courses completed) -->
  <div class="stat-badge">
    <div class="stat-icon">🥇</div>
    <div class="stat-info">
      <div class="stat-label">Badges</div>
      <div class="stat-value" id="badgesEarned">0/30</div>
    </div>
  </div>

  <!-- Rank Badge (NEW: Based on courses completed) -->
  <div class="stat-badge">
    <div class="stat-icon">👑</div>
    <div class="stat-info">
      <div class="stat-label">Rank</div>
      <div class="stat-value" id="currentRank">🎯 Beginner</div>
    </div>
  </div>
</div>
```

### Shared Utils Function

Add this helper function to `shared/js/utils.js`:

```javascript
/**
 * Get rank information based on courses completed
 * MUST match backend getRankInfo() function
 */
export function getRankInfo(coursesCompleted) {
  const ranks = [
    { level: 0, name: 'Beginner', icon: '🎯' },
    { level: 1, name: 'Apprentice', icon: '📚' },
    { level: 2, name: 'Student', icon: '✏️' },
    { level: 3, name: 'Learner', icon: '📖' },
    { level: 4, name: 'Scholar', icon: '🎓' },
    { level: 5, name: 'Intermediate', icon: '⭐' },
    { level: 6, name: 'Practitioner', icon: '🔧' },
    { level: 7, name: 'Developer', icon: '💻' },
    { level: 8, name: 'Builder', icon: '🏗️' },
    { level: 9, name: 'Creator', icon: '🎨' },
    { level: 10, name: 'Advanced', icon: '🚀' },
    { level: 11, name: 'Skilled', icon: '💪' },
    { level: 12, name: 'Professional', icon: '💼' },
    { level: 13, name: 'Specialist', icon: '🎯' },
    { level: 14, name: 'Expert', icon: '⚡' },
    { level: 15, name: 'Master', icon: '🏆' },
    { level: 16, name: 'Veteran', icon: '🛡️' },
    { level: 17, name: 'Elite', icon: '⭐⭐' },
    { level: 18, name: 'Champion', icon: '🏅' },
    { level: 19, name: 'Hero', icon: '🦸' },
    { level: 20, name: 'Legend', icon: '👑' },
    { level: 21, name: 'Grandmaster', icon: '🎖️' },
    { level: 22, name: 'Sage', icon: '🧙' },
    { level: 23, name: 'Guru', icon: '🕉️' },
    { level: 24, name: 'Virtuoso', icon: '🎼' },
    { level: 25, name: 'Prodigy', icon: '🌟' },
    { level: 26, name: 'Genius', icon: '🧠' },
    { level: 27, name: 'Titan', icon: '💎' },
    { level: 28, name: 'Deity', icon: '⚡⚡' },
    { level: 29, name: 'Immortal', icon: '🔥' },
    { level: 30, name: 'Transcendent', icon: '✨' }
  ];

  const level = Math.min(coursesCompleted, 30);
  return ranks[level];
}
```

---

## Dashboard Integration (Badges/Ranks)

### Course Completion Tracking

Ensure your tutorial pages track `course_completed` event when finished:

```javascript
// In your tutorial's completeQuest() or completeCourse() function
function completeCourse() {
  trackProgress('course_completed', 0, {
    course_id: COURSE_CONFIG.id,
    total_xp: totalXP,
    total_units: TOTAL_STEPS,
    completion_time_seconds: timeSpent,
    final_score: 100
  });

  showCompletionSection();
}
```

**Critical:** Every course MUST track `course_completed` event for badge/rank calculation to work!

### Dashboard Display Logic

The dashboard automatically displays badges and rank from the API response. No special logic needed beyond the `updateStudentSummary()` function shown above.

### Teacher/Admin Views

Teachers and admins can see student badges and ranks in the student detail views:

```javascript
// In teacher/js/student-detail.js or admin/js/student-detail.js
function displayStudentInfo(data) {
  const summary = data.summary || {};

  // Display badges
  document.getElementById('studentBadges').textContent =
    `${summary.badges || 0}/30 Badges`;

  // Display rank with icon
  document.getElementById('studentRank').textContent =
    `${summary.rankIcon || '🎯'} ${summary.rankName || 'Beginner'}`;

  // Display courses completed
  document.getElementById('coursesCompleted').textContent =
    `${summary.coursesCompleted || 0} courses completed`;
}
```

---

## Migration from XP-Based System

### Why Migrate?

**Old System Problems:**
1. **Total XP didn't sum correctly** - Dashboard showed 100 XP when student had 200 XP across two courses
2. **Badges were XP-based (1 per 100 XP)** - Confusing because different courses gave different XP
3. **Rank was XP-based** - Students couldn't understand why rank changed inconsistently

**New System Advantages:**
1. **Clear Goal** - "Complete courses to earn badges and rank up"
2. **Simple Calculation** - Just count completed courses
3. **Consistent** - Every course = 1 badge = 1 rank level
4. **Motivating** - 30 unique rank names provide clear progression milestones

### Migration Steps

#### Step 1: Update Backend

Add the new functions to `backend/routes.js`:

```javascript
// Add calculateBadgesAndRank() and getRankInfo() functions (shown above)

// Update calculateStudentStats() to include badge/rank data
function calculateStudentStats(events) {
  // ... existing code ...

  const badgeRankData = calculateBadgesAndRank(events);

  return {
    // ... existing fields ...
    badges: badgeRankData.badges,
    rank: badgeRankData.rank,
    rankName: badgeRankData.rankName,
    rankIcon: badgeRankData.rankIcon,
    coursesCompleted: badgeRankData.coursesCompleted
  };
}
```

#### Step 2: Update Frontend Utils

Add `getRankInfo()` to `shared/js/utils.js` (shown above).

#### Step 3: Update Dashboard Display

Modify `student/js/dashboard.js` to use new badge/rank fields:

```javascript
// Update badges display
document.getElementById('badgesEarned').textContent = `${summary.badges || 0}/30`;

// Update rank display
const rankName = summary.rankName || 'Beginner';
const rankIcon = summary.rankIcon || '🎯';
document.getElementById('currentRank').textContent = `${rankIcon} ${rankName}`;
```

#### Step 4: Update Course Completion Events

Ensure ALL tutorial pages track `course_completed`:

```javascript
// At the end of every course
trackProgress('course_completed', 0, {
  course_id: COURSE_CONFIG.id,
  total_xp: totalXP,
  total_units: TOTAL_STEPS,
  completion_time_seconds: timeSpent
});
```

#### Step 5: Test Migration

**Testing Checklist:**
- [ ] API returns `badges`, `rank`, `rankName`, `rankIcon` fields
- [ ] Dashboard displays badges as `X/30` format
- [ ] Dashboard displays rank with icon and name
- [ ] Complete a course → Badge count increases by 1
- [ ] Complete a course → Rank advances to next level
- [ ] Rank name matches table (e.g., 2 courses = "Student ✏️")
- [ ] Teacher/admin views show badges and rank
- [ ] Existing students see correct badge/rank based on completed courses

### Data Migration

No database migration required! The system automatically calculates badges/rank from existing completion events.

**✅ BACKWARD COMPATIBILITY (v4.1 - October 2025):**

The `calculateBadgesAndRank()` function now accepts **BOTH** event types:
- `course_completed` (standard completion event)
- `quest_completed` (legacy completion event from earlier tutorials)

This means:
- ✅ Existing `quest_completed` events will be automatically recognized
- ✅ New tutorials can use either event type
- ✅ **No backfilling required** for most cases
- ✅ System works with mixed event types across courses

**When You Still Need Backfilling:**

If students completed courses but didn't trigger **ANY** completion event (neither `quest_completed` nor `course_completed`), you'll need to:

1. **Identify completed courses** - Check for 100% progress without completion events
2. **Insert completion events** - Backfill using either event type
3. **Re-calculate stats** - API will automatically pick up new events

**Example backfill script:**
```javascript
// Find students with 100% progress who don't have ANY completion event
db.query(`
  SELECT DISTINCT student_id, course_id
  FROM progress_events
  WHERE (event_type = 'level_unlocked' AND progress_percentage = 100)
  AND student_id NOT IN (
    -- Exclude students who already have completion events
    SELECT student_id FROM progress_events
    WHERE event_type IN ('course_completed', 'quest_completed')
  )
`, (err, results) => {
  results.forEach(row => {
    // Insert course_completed event (or use quest_completed for legacy compatibility)
    db.addProgressEvent(
      row.student_id,
      'course_completed',  // or 'quest_completed'
      0,
      row.course_id,  // course_id as 4th parameter
      JSON.stringify({ course_id: row.course_id })
    );
  });
});
```

---

## Summary

**Key Points:**
1. **1 Course = 1 Badge = 1 Rank Level**
2. **30 total ranks** with unique names and icons
3. **XP still tracked** but only for reference
4. **Simple calculation** - Count completion events (`course_completed` OR `quest_completed`)
5. **Backend function:** `calculateBadgesAndRank()`
6. **Frontend function:** `getRankInfo()`
7. **Backward compatible:** Accepts both `course_completed` and `quest_completed` events
8. **Fallback logic:** Gets `course_id` from `data.course_id` OR `event.course_id`

**Next Steps:**
1. Implement backend functions in `routes.js`
2. Update frontend display in `dashboard.js`
3. Ensure all courses track completion event (`course_completed` or `quest_completed`)
4. Test badge/rank progression
5. Backfill data only if needed (most courses work without backfilling)

---

# ═══════════════════════════════════════════════════════════════════════════
# PART 5: UNIVERSAL COURSE MODEL (ADVANCED)
# ═══════════════════════════════════════════════════════════════════════════

Advanced architecture for creating any type of course (quiz, step, activity, mixed, video, project) with a single, reusable system.

---

## 🌟 Universal Course Model (v3.0)

### Overview

The Universal Course Model provides a **single, reusable structure** for creating any type of educational content - whether it's quizzes, step-by-step tutorials, activities, videos, projects, or mixed formats.

**Key Benefits:**
- ✅ **One database structure** for all course types
- ✅ **One frontend tracking pattern** for any course
- ✅ **One backend calculation function** for all progress
- ✅ **One dashboard renderer** for all courses
- ✅ **Easy to add new courses** without code changes
- ✅ **Consistent student experience** across all content

### Philosophy

Instead of creating custom code for each course type (quizzes vs. steps vs. activities), we use a **metadata-driven approach** where:
1. Course metadata defines the course type and behavior
2. Universal event types track all progress
3. Frontend/backend use the same code for all courses
4. Dashboard dynamically renders based on metadata

---

## Database Structure

### Enhanced Courses Table

Add these fields to your `courses` table:

```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    total_levels INTEGER DEFAULT 1,
    course_type TEXT DEFAULT 'step',  -- NEW: quiz, step, activity, mixed, video, project
    xp_per_unit INTEGER DEFAULT 20,   -- NEW: XP earned per completion (step/quiz/activity)
    completion_criteria TEXT,         -- NEW: JSON with requirements
    unlock_requirements TEXT,         -- Existing field
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Course Type Values:**
- `step` - Step-by-step tutorials (Install Studio)
- `quiz` - Quiz-based learning (Studio Basics)
- `activity` - Interactive activities (Build a Part)
- `mixed` - Combination of steps + quizzes
- `video` - Video watching with progress
- `project` - Project-based learning

**Completion Criteria JSON Structure:**
```json
{
  "units_required": 5,           // Total steps/quizzes/activities
  "min_score": 80,               // Optional: Minimum score percentage
  "must_complete_all": true,     // Optional: Require 100% completion
  "time_limit_minutes": 60       // Optional: Time constraint
}
```

### Example Course Entries

```sql
-- Course 1: Step-based tutorial (Install Studio)
INSERT INTO courses (id, title, description, url, display_order, total_levels, course_type, xp_per_unit, completion_criteria)
VALUES (
  4,
  '📦 Install Roblox Studio',
  'Set up your development environment',
  'install_roblox_studio.html',
  1,
  5,
  'step',
  20,
  '{"units_required": 5, "must_complete_all": true}'
);

-- Course 2: Quiz-based tutorial (Studio Basics)
INSERT INTO courses (id, title, description, url, display_order, total_levels, course_type, xp_per_unit, completion_criteria)
VALUES (
  1,
  '🌟 Roblox Studio Quest',
  'Learn the basics of Roblox Studio',
  'versions/v9_game_style.html',
  2,
  6,
  'quiz',
  100,
  '{"units_required": 6, "min_score": 80}'
);

-- Course 3: Activity-based tutorial
INSERT INTO courses (id, title, description, url, display_order, total_levels, course_type, xp_per_unit, completion_criteria)
VALUES (
  5,
  '🎨 Build Your First Part',
  'Create a basic 3D part in Studio',
  'build_first_part.html',
  3,
  3,
  'activity',
  50,
  '{"units_required": 3, "must_complete_all": true}'
);

-- Course 4: Mixed tutorial (steps + quizzes)
INSERT INTO courses (id, title, description, url, display_order, total_levels, course_type, xp_per_unit, completion_criteria)
VALUES (
  6,
  '🔧 Advanced Scripting',
  'Learn Lua scripting with practice',
  'advanced_scripting.html',
  4,
  10,
  'mixed',
  30,
  '{"units_required": 10, "min_score": 70}'
);
```

---

## Universal Event Types

Instead of different events for each course type, use **three universal events** that work for everything:

### 1. `progress_made`
Tracks completion of any unit (step, quiz question, activity, video checkpoint)

**Data Structure:**
```json
{
  "course_id": 4,
  "unit_number": 1,
  "unit_type": "step",       // or "quiz", "activity", "video_checkpoint"
  "correct": true,           // Optional: For quizzes/activities
  "score": 100,              // Optional: For scored activities
  "attempt": 1,              // Optional: Attempt number
  "time_spent_seconds": 45   // Optional: Time tracking
}
```

**Usage Examples:**
```javascript
// Step completed
trackProgress('progress_made', 0, {
  course_id: 4,
  unit_number: 1,
  unit_type: 'step'
});

// Quiz answered
trackProgress('progress_made', level, {
  course_id: 1,
  unit_number: 1,
  unit_type: 'quiz',
  correct: true,
  attempt: 1
});

// Activity completed
trackProgress('progress_made', 0, {
  course_id: 5,
  unit_number: 2,
  unit_type: 'activity',
  score: 85,
  time_spent_seconds: 120
});

// Video checkpoint
trackProgress('progress_made', 0, {
  course_id: 7,
  unit_number: 3,
  unit_type: 'video_checkpoint',
  time_spent_seconds: 180
});
```

### 2. `level_unlocked`
Tracks major milestone completion (level, section, module)

**Data Structure:**
```json
{
  "course_id": 1,
  "level": 2,
  "xp_earned": 100,
  "timestamp": "2025-01-23T10:30:00Z"
}
```

**Usage:**
```javascript
// Unlock next level after quiz
trackProgress('level_unlocked', level, {
  course_id: 1,
  level: level,
  xp_earned: 100
});
```

### 3. `course_completed`
Tracks full course completion

**Data Structure:**
```json
{
  "course_id": 4,
  "total_xp": 100,
  "total_units": 5,
  "completion_time_seconds": 300,
  "final_score": 100,        // Optional: For scored courses
  "timestamp": "2025-01-23T10:45:00Z"
}
```

**Usage:**
```javascript
// Course completed
trackProgress('course_completed', 0, {
  course_id: 4,
  total_xp: totalXP,
  total_units: TOTAL_STEPS,
  completion_time_seconds: timeSpent,
  final_score: 100
});
```

---

## Universal Frontend Tracking Pattern

### JavaScript Template (Works for ALL Course Types)

```javascript
// ===========================
// UNIVERSAL CONFIGURATION
// ===========================

const COURSE_CONFIG = {
  id: 4,                          // From database courses.id
  type: 'step',                   // step, quiz, activity, mixed, video, project
  xpPerUnit: 20,                  // From database courses.xp_per_unit
  totalUnits: 5,                  // From database courses.completion_criteria.units_required
  storageKey: 'course_4_progress' // Unique key for localStorage
};

let completedUnits = 0;
let totalXP = 0;
let courseStartTime = null;

// ===========================
// UNIVERSAL TRACKING FUNCTION
// ===========================

function trackUnitCompletion(unitNumber, additionalData = {}) {
  completedUnits++;
  totalXP += COURSE_CONFIG.xpPerUnit;

  // Update UI
  updateStatsDisplay();

  // Track to backend
  trackProgress('progress_made', 0, {
    course_id: COURSE_CONFIG.id,
    unit_number: unitNumber,
    unit_type: COURSE_CONFIG.type,
    ...additionalData
  });

  // Check if course completed
  if (completedUnits === COURSE_CONFIG.totalUnits) {
    completeCourse();
  }

  // Save to localStorage (backup)
  saveProgress();
}

// ===========================
// COMPLETE COURSE
// ===========================

function completeCourse() {
  const timeSpent = Math.floor((Date.now() - courseStartTime) / 1000);

  trackProgress('course_completed', 0, {
    course_id: COURSE_CONFIG.id,
    total_xp: totalXP,
    total_units: completedUnits,
    completion_time_seconds: timeSpent,
    final_score: calculateScore() // Optional
  });

  // Show completion UI
  showCompletionSection();
}

// ===========================
// USAGE EXAMPLES FOR DIFFERENT COURSE TYPES
// ===========================

// STEP-BASED COURSE (Install Studio)
function toggleStep(stepNumber) {
  const checkbox = document.getElementById(`checkbox-${stepNumber}`);

  if (checkbox.checked) {
    trackUnitCompletion(stepNumber);
  } else {
    // Handle unchecking
    completedUnits = Math.max(0, completedUnits - 1);
    totalXP = completedUnits * COURSE_CONFIG.xpPerUnit;
    updateStatsDisplay();
  }
}

// QUIZ-BASED COURSE (Studio Basics)
function checkAnswer(questionNumber, isCorrect) {
  if (isCorrect) {
    trackUnitCompletion(questionNumber, {
      correct: true,
      attempt: 1
    });

    // Unlock next level
    trackProgress('level_unlocked', questionNumber, {
      course_id: COURSE_CONFIG.id,
      level: questionNumber,
      xp_earned: COURSE_CONFIG.xpPerUnit
    });
  }
}

// ACTIVITY-BASED COURSE (Build a Part)
function submitActivity(activityNumber, score) {
  trackUnitCompletion(activityNumber, {
    score: score,
    time_spent_seconds: getActivityTime()
  });
}

// VIDEO-BASED COURSE
function onVideoCheckpoint(checkpointNumber, videoTime) {
  trackUnitCompletion(checkpointNumber, {
    time_spent_seconds: Math.floor(videoTime)
  });
}

// MIXED COURSE (Steps + Quizzes)
function handleMixedUnit(unitNumber, unitType, data) {
  trackUnitCompletion(unitNumber, {
    unit_type: unitType,
    ...data
  });
}
```

---

## Universal Backend Calculation

### Single Function for All Course Types

Update `backend/routes.js` with this universal stats calculator:

```javascript
/**
 * Calculate student stats for ANY course type
 * Works with progress_made, level_unlocked, and course_completed events
 */
function calculateUniversalStats(events, courseId = null) {
  if (!events || events.length === 0) {
    return {
      current_level: 0,
      progress_percentage: 0,
      total_xp: 0,
      units_completed: 0,
      time_spent_seconds: 0,
      course_completed: false
    };
  }

  // Filter by course if specified
  const courseEvents = courseId
    ? events.filter(e => {
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          return data.course_id === courseId;
        } catch {
          return false;
        }
      })
    : events;

  // Count unique units completed (progress_made events)
  const progressEvents = courseEvents.filter(e => e.event_type === 'progress_made');
  const completedUnits = new Set();
  let totalXP = 0;
  let totalTimeSpent = 0;

  progressEvents.forEach(event => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      // Track unique units
      completedUnits.add(data.unit_number);

      // Sum time spent
      if (data.time_spent_seconds) {
        totalTimeSpent += data.time_spent_seconds;
      }
    } catch (error) {
      console.error('Error parsing progress event:', error);
    }
  });

  // Count levels unlocked
  const levelsUnlocked = new Set(
    courseEvents
      .filter(e => e.event_type === 'level_unlocked')
      .map(e => {
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          return data.level;
        } catch {
          return null;
        }
      })
      .filter(level => level !== null)
  );
  const currentLevel = levelsUnlocked.size > 0 ? Math.max(...levelsUnlocked) : 0;

  // Check if course completed
  const courseCompletedEvents = courseEvents.filter(e => e.event_type === 'course_completed');
  const courseCompleted = courseCompletedEvents.length > 0;

  // Calculate XP from completed events
  if (courseCompletedEvents.length > 0) {
    // Use XP from completion event
    try {
      const completionData = typeof courseCompletedEvents[0].data === 'string'
        ? JSON.parse(courseCompletedEvents[0].data)
        : courseCompletedEvents[0].data;
      totalXP = completionData.total_xp || 0;
    } catch {
      // Fallback: Calculate from database course metadata
      totalXP = completedUnits.size * 20; // Default XP per unit
    }
  } else {
    // Calculate XP from database course metadata
    // TODO: Fetch course.xp_per_unit from database
    totalXP = completedUnits.size * 20; // Default for now
  }

  // Get total units from database (or use default)
  // TODO: Fetch course.completion_criteria.units_required from database
  const totalUnitsRequired = 5; // Default for now

  // Calculate progress percentage
  const progressPercentage = totalUnitsRequired > 0
    ? Math.round((completedUnits.size / totalUnitsRequired) * 100)
    : 0;

  return {
    current_level: currentLevel,
    progress_percentage: Math.min(progressPercentage, 100),
    total_xp: totalXP,
    units_completed: completedUnits.size,
    levels_unlocked: levelsUnlocked.size,
    time_spent_seconds: totalTimeSpent,
    course_completed: courseCompleted
  };
}
```

### Enhanced API Endpoint

Add course-specific stats to `/api/students/:id`:

```javascript
router.get('/api/students/:id', (req, res) => {
  const studentId = parseInt(req.params.id);

  db.getStudentById(studentId, (err, student) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    db.getStudentProgress(studentId, (err, events) => {
      if (err) return res.status(500).json({ error: err.message });

      // Overall stats (all courses combined)
      const overallStats = calculateUniversalStats(events);

      // Per-course stats
      const courseStats = {};
      const courseIds = new Set(events.map(e => {
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          return data.course_id;
        } catch {
          return null;
        }
      }).filter(id => id !== null));

      courseIds.forEach(courseId => {
        courseStats[courseId] = calculateUniversalStats(events, courseId);
      });

      res.json({
        student,
        overall_stats: overallStats,
        course_stats: courseStats,
        all_events: events
      });
    });
  });
});
```

---

## Universal Dashboard Rendering

### Single Renderer for All Course Types

Update `student/js/dashboard.js` with this universal renderer:

```javascript
function renderCourses() {
  const container = document.getElementById('coursesContainer');

  if (!studentProgress) {
    container.innerHTML = '<p class="text-center text-muted">Loading courses...</p>';
    return;
  }

  container.innerHTML = availableCourses.map(course => {
    // Get course-specific stats from backend
    const courseStats = studentProgress.course_stats
      ? studentProgress.course_stats[course.id] || {}
      : {};

    // Extract data
    const currentLevel = courseStats.current_level || 0;
    const progressPercent = courseStats.progress_percentage || 0;
    const xpEarned = courseStats.total_xp || 0;
    const unitsCompleted = courseStats.units_completed || 0;
    const courseCompleted = courseStats.course_completed || false;

    // Parse completion criteria
    let totalUnits = course.total_levels; // Default
    try {
      const criteria = typeof course.completion_criteria === 'string'
        ? JSON.parse(course.completion_criteria)
        : course.completion_criteria;
      totalUnits = criteria.units_required || course.total_levels;
    } catch {
      // Use default
    }

    // Calculate time spent
    const timeSpentSec = courseStats.time_spent_seconds || 0;
    const hours = Math.floor(timeSpentSec / 3600);
    const minutes = Math.floor((timeSpentSec % 3600) / 60);
    const timeSpent = timeSpentSec > 0
      ? (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
      : 'Not started';

    // Last active
    const lastActive = studentProgress.student && studentProgress.student.last_active
      ? formatRelativeTime(studentProgress.student.last_active)
      : 'Never';

    // Status badge
    let statusBadge = '';
    let statusClass = '';

    if (courseCompleted) {
      statusBadge = '✅ COMPLETED';
      statusClass = 'status-completed';
    } else if (progressPercent > 0) {
      statusBadge = '📍 IN PROGRESS';
      statusClass = 'status-active';
    } else {
      statusBadge = '🔓 AVAILABLE';
      statusClass = 'status-available';
    }

    // Unlock logic (check unlock_requirements)
    let isUnlocked = true; // Simplified for now

    // Course type display
    const courseTypeLabels = {
      'step': 'Steps',
      'quiz': 'Levels',
      'activity': 'Activities',
      'mixed': 'Units',
      'video': 'Videos',
      'project': 'Projects'
    };
    const unitLabel = courseTypeLabels[course.course_type] || 'Units';

    // Render card
    return `
      <div class="course-card ${isUnlocked ? 'active' : 'locked'}">
        <div class="course-header">
          <div>
            <h4 class="course-title">${course.title}</h4>
            <p class="course-description">${course.description}</p>
          </div>
          <span class="course-status-badge ${statusClass}">${statusBadge}</span>
        </div>

        ${progressPercent > 0 ? `
          <div class="course-progress">
            <div class="d-flex justify-content-between mb-2">
              <span>Progress</span>
              <span><strong>${progressPercent}%</strong> (${unitsCompleted}/${totalUnits} ${unitLabel})</span>
            </div>
            <div class="progress">
              <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%">
                ${progressPercent}%
              </div>
            </div>
          </div>
        ` : ''}

        ${isUnlocked ? `
          <div class="course-stats">
            <div class="course-stat">
              <div class="course-stat-value">${unitsCompleted}/${totalUnits}</div>
              <div class="course-stat-label">${unitLabel}</div>
            </div>
            <div class="course-stat">
              <div class="course-stat-value">${xpEarned}</div>
              <div class="course-stat-label">XP Earned</div>
            </div>
            <div class="course-stat">
              <div class="course-stat-value">${timeSpent}</div>
              <div class="course-stat-label">Time Spent</div>
            </div>
            <div class="course-stat">
              <div class="course-stat-value">${lastActive}</div>
              <div class="course-stat-label">Last Active</div>
            </div>
          </div>

          <div class="course-actions">
            <button class="btn btn-primary btn-lg" onclick="window.startCourse('${course.url}', ${course.id})">
              ▶ ${progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
            </button>
            ${progressPercent > 0 ? `
              <button class="btn btn-outline-primary" onclick="window.viewCourseProgress(${course.id})">
                📊 View My Progress
              </button>
            ` : ''}
          </div>
        ` : `
          <div class="lock-requirements">
            <h6>🔐 Unlock Requirements:</h6>
            <p>Complete previous courses first</p>
          </div>
        `}
      </div>
    `;
  }).join('');
}
```

---

## Course Type Examples

### Example 1: Step-Based Tutorial

**Database Entry:**
```sql
INSERT INTO courses VALUES (
  4, '📦 Install Roblox Studio', 'Set up your dev environment',
  'install_roblox_studio.html', 1, 5, 'step', 20,
  '{"units_required": 5, "must_complete_all": true}', null
);
```

**Frontend Usage:**
```javascript
const COURSE_CONFIG = {
  id: 4,
  type: 'step',
  xpPerUnit: 20,
  totalUnits: 5
};

function toggleStep(stepNumber) {
  if (checkbox.checked) {
    trackUnitCompletion(stepNumber);
  }
}
```

### Example 2: Quiz-Based Tutorial

**Database Entry:**
```sql
INSERT INTO courses VALUES (
  1, '🌟 Roblox Studio Quest', 'Learn Studio basics',
  'versions/v9_game_style.html', 2, 6, 'quiz', 100,
  '{"units_required": 6, "min_score": 80}', null
);
```

**Frontend Usage:**
```javascript
const COURSE_CONFIG = {
  id: 1,
  type: 'quiz',
  xpPerUnit: 100,
  totalUnits: 6
};

function checkAnswer(level, isCorrect) {
  if (isCorrect) {
    trackUnitCompletion(level, { correct: true });

    // Unlock next level
    trackProgress('level_unlocked', level, {
      course_id: 1,
      level: level,
      xp_earned: 100
    });
  }
}
```

### Example 3: Activity-Based Course

**Database Entry:**
```sql
INSERT INTO courses VALUES (
  5, '🎨 Build Your First Part', 'Create 3D parts',
  'build_first_part.html', 3, 3, 'activity', 50,
  '{"units_required": 3}', null
);
```

**Frontend Usage:**
```javascript
const COURSE_CONFIG = {
  id: 5,
  type: 'activity',
  xpPerUnit: 50,
  totalUnits: 3
};

function submitActivity(activityNum, score) {
  trackUnitCompletion(activityNum, {
    score: score,
    time_spent_seconds: getTimer()
  });
}
```

### Example 4: Mixed Course (Steps + Quizzes)

**Database Entry:**
```sql
INSERT INTO courses VALUES (
  6, '🔧 Advanced Scripting', 'Learn Lua with practice',
  'advanced_scripting.html', 4, 10, 'mixed', 30,
  '{"units_required": 10, "min_score": 70}', null
);
```

**Frontend Usage:**
```javascript
const COURSE_CONFIG = {
  id: 6,
  type: 'mixed',
  xpPerUnit: 30,
  totalUnits: 10
};

function handleUnit(unitNum, type) {
  if (type === 'step') {
    trackUnitCompletion(unitNum, { unit_type: 'step' });
  } else if (type === 'quiz') {
    trackUnitCompletion(unitNum, {
      unit_type: 'quiz',
      correct: isCorrect
    });
  }
}
```

### Example 5: Video-Based Course

**Database Entry:**
```sql
INSERT INTO courses VALUES (
  7, '🎥 Studio Tour Video', 'Guided video walkthrough',
  'studio_tour_video.html', 5, 5, 'video', 10,
  '{"units_required": 5}', null
);
```

**Frontend Usage:**
```javascript
const COURSE_CONFIG = {
  id: 7,
  type: 'video',
  xpPerUnit: 10,
  totalUnits: 5 // 5 checkpoints
};

// YouTube API integration
player.addEventListener('onStateChange', (event) => {
  const currentTime = player.getCurrentTime();

  if (currentTime > 60 && !checkpoint1) {
    checkpoint1 = true;
    trackUnitCompletion(1, {
      time_spent_seconds: Math.floor(currentTime)
    });
  }
});
```

### Example 6: Project-Based Course

**Database Entry:**
```sql
INSERT INTO courses VALUES (
  8, '🏗️ Build an Obby Game', 'Create a full obstacle course',
  'build_obby_project.html', 6, 8, 'project', 75,
  '{"units_required": 8}', null
);
```

**Frontend Usage:**
```javascript
const COURSE_CONFIG = {
  id: 8,
  type: 'project',
  xpPerUnit: 75,
  totalUnits: 8 // 8 project milestones
};

function submitMilestone(milestoneNum, screenshotUrl) {
  trackUnitCompletion(milestoneNum, {
    screenshot: screenshotUrl,
    time_spent_seconds: getMilestoneTime()
  });
}
```

---

## Migration Guide

### Migrating Existing Courses to Universal Model

**Step 1: Update Database Schema**

```sql
-- Add new fields to courses table
ALTER TABLE courses ADD COLUMN course_type TEXT DEFAULT 'step';
ALTER TABLE courses ADD COLUMN xp_per_unit INTEGER DEFAULT 20;
ALTER TABLE courses ADD COLUMN completion_criteria TEXT;

-- Update existing courses
UPDATE courses SET
  course_type = 'step',
  xp_per_unit = 20,
  completion_criteria = '{"units_required": 5}'
WHERE id = 4; -- Install Studio

UPDATE courses SET
  course_type = 'quiz',
  xp_per_unit = 100,
  completion_criteria = '{"units_required": 6, "min_score": 80}'
WHERE id = 1; -- Studio Basics
```

**Step 2: Update Frontend Tracking**

Replace old tracking code with universal pattern:

```javascript
// OLD (Install Studio specific)
function toggleStep(stepNumber) {
  trackProgress('step_checked', 0, { step: stepNumber });
}

// NEW (Universal)
function toggleStep(stepNumber) {
  trackUnitCompletion(stepNumber);
}
```

**Step 3: Update Backend Calculation**

Replace `calculateStudentStats()` with `calculateUniversalStats()` in `routes.js`.

**Step 4: Update Dashboard**

Replace course-specific rendering with universal `renderCourses()` function.

**Step 5: Test Migration**

- [ ] Verify existing student progress still loads correctly
- [ ] Test new course creation with different types
- [ ] Verify XP calculations are accurate
- [ ] Test dashboard display for all course types
- [ ] Verify progress tracking works for all types

---

## Benefits Summary

### For Developers:
- ✅ **80% less code** - One implementation for all courses
- ✅ **Faster development** - Add courses via database, not code
- ✅ **Easier maintenance** - Fix bugs once, all courses benefit
- ✅ **Better testing** - Test one system, not multiple implementations

### For Educators:
- ✅ **Flexible content types** - Mix quizzes, steps, activities
- ✅ **Easy course creation** - Just add database entry
- ✅ **Consistent analytics** - Same metrics across all courses
- ✅ **Reusable templates** - Copy existing courses

### For Students:
- ✅ **Consistent experience** - Same UI for all courses
- ✅ **Clear progress tracking** - Same stats across content
- ✅ **Unified XP system** - Compare progress easily
- ✅ **Reliable persistence** - Progress never lost

---

## Next Steps

1. **Implement database migration** - Add new fields to courses table
2. **Update backend API** - Replace old calculation with universal function
3. **Migrate existing courses** - Update Install Studio and Studio Basics
4. **Test thoroughly** - Verify all course types work correctly
5. **Create new courses** - Use universal model for all future content
6. **Document patterns** - Add examples to this guide

---

# ═══════════════════════════════════════════════════════════════════════════
# PART 6: REFERENCE & SUPPORT
# ═══════════════════════════════════════════════════════════════════════════

Quick reference guides, troubleshooting tips, and support resources.

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

- **v4.2** (2025-10-26) - showCompletion() Quest Tracking Fix
  - ⚠️ **CRITICAL FIX:** `showCompletion()` function now tracks `quest_completed` event
  - ✅ **Problem Solved:** Progress stuck at 83% despite earning 1080 XP (full completion)
  - ✅ **Root Cause:** Students completed final quiz but `showCompletion()` didn't create completion event
  - ✅ **Solution:** Added `trackProgress('quest_completed', ...)` at start of `showCompletion()` function
  - ✅ **Impact:** Dashboard now always shows 100% progress when course completed
  - ✅ **Files Changed:** `courses/studio-basics.html:1781-1787` (+6 lines)
  - ✅ **Pattern 3 Updated:** Added showCompletion() example with critical fix warning
  - 📝 **Before:** Student earned 1080 XP → Progress showed 83% (5/6 levels) ❌
  - 📝 **After:** Student earned 1080 XP → Progress shows 100% (6/6 levels) ✅
  - 📝 **Dashboard Logic:** Requires `quest_completed` event to display 100% (see `student/js/dashboard.js:296-307`)

- **v4.1** (2025-10-24) - Badge & Rank Backward Compatibility Fix
  - ✅ **CRITICAL FIX:** `calculateBadgesAndRank()` now accepts BOTH event types
  - ✅ **Backward Compatible:** Recognizes `quest_completed` AND `course_completed` events
  - ✅ **Fallback Logic:** Gets `course_id` from `data.course_id` OR `event.course_id`
  - ✅ **Impact:** Existing tutorials using `quest_completed` now count toward badges/rank
  - ✅ **Migration:** No backfilling required for most existing courses
  - ✅ **Documentation:** Updated Data Migration section with compatibility notes
  - 📝 **Problem Solved:** Students with completed courses showing 0/30 badges
  - 📝 **Example:** Install Roblox Studio completion now properly awards 1 badge

- **v4.0** (2025-01-24) - Badge & Rank System v2.0
  - ✅ **NEW SYSTEM:** Course-based progression (1 course = 1 badge = 1 rank)
  - ✅ **30-Level Rank System** - Unique names and icons (Beginner → Transcendent)
  - ✅ **Badge System** - Total badges = courses completed (max 30)
  - ✅ **Simple Calculation** - Count `course_completed` events
  - ✅ **Backend Functions** - `calculateBadgesAndRank()` and `getRankInfo()`
  - ✅ **Frontend Display** - Badge/rank display in dashboard
  - ✅ **Migration Guide** - Complete 5-step migration from XP-based system
  - ✅ **Comprehensive Documentation** - Full implementation guide with examples
  - ✅ **Impact:** Clear, motivating progression system that students understand
  - 📝 **Note:** XP still tracked for reference but doesn't affect badges/rank

- **v3.1** (2025-01-24) - Course Progress Integration Patterns & Fixes
  - ✅ **Critical Fix:** Backend XP calculation now counts step XP (not just quiz XP)
  - ✅ **Critical Fix:** Dashboard displays progress for all courses (not just Course ID 1)
  - ✅ **Critical Fix:** Complete Quest button tracks level_unlocked event
  - ✅ **Critical Fix:** Backend recognizes quest_completed for 100% progress
  - ✅ **New Section:** Course Progress Integration Patterns (5 patterns documented)
  - ✅ **Complete Integration Checklist** - Frontend, Backend, Dashboard, Testing
  - ✅ **Common Mistakes Guide** - 4 mistakes with fixes
  - ✅ **Debugging Guide** - Solutions for 4 common progress issues
  - ✅ **Impact:** Install Studio now displays correctly on student dashboard

- **v3.0** (2025-01-23) - Universal Course Model
  - ✅ **Universal course architecture** - One system for all course types
  - ✅ **Enhanced database structure** - course_type, xp_per_unit, completion_criteria
  - ✅ **Universal event types** - progress_made, level_unlocked, course_completed
  - ✅ **Universal frontend pattern** - COURSE_CONFIG + trackUnitCompletion()
  - ✅ **Universal backend calculation** - calculateUniversalStats() function
  - ✅ **Universal dashboard renderer** - Single renderCourses() for all types
  - ✅ **6 course type examples** - step, quiz, activity, mixed, video, project
  - ✅ **Migration guide** - 5-step process with SQL commands
  - ✅ **Benefits:** 80% less code, faster development, easier maintenance

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
