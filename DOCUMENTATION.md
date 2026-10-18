# Ingenio Documentation
This documents explains how Ingenio is built. It is written for anyone working on it (including future us :p).

If you only want to run the site, skip to [Running Ingenio locally](#running-ingenio-locally).

## Contents
1. [What Ingenio Is](#what-ingenio-is)
2. [How the project is organised](#how-the-project-is-organised)
3. [The pages](#the-pages)
4. [Shared code](#shared-code)
5. [Accounts and the sign up flow](#accounts-and-the-sign-up-flow)
6. [The database](#the-database)
7. [The design system](#the-design-system)
8. [The dashboard/home](#the-dashboard)
9. [Lessons and lessons.json](#lessons)
10. [Practice questions](#practice-questions)
11. [The question engine](#the-question-engine)
12. [Writing a new question generator](#writing-a-new-question-generator)
13. [The tools](#the-tools)
14. [Running Ingenio locally](#running-ingenio-locally)
15. [Deploying](#deploying)

## What Ingenio Is
Ingenio is a free, open source (as I'm sure you already know) GCSE and A-level maths revision website for students in the UK, bringing lessons, practice questions, past papers and an AI tutor together in one place. Everything a student needs to revise and get top marks is free, but there is a premium plan to both support us, remove the ads, and remove the daily limit on the AI tutor.

## How the project is organised
icba to add the file tree

To keep it tidy:
- Each page lives one folder deep, so pages always link to each other with `../folder/file.html`
- Anything more than one page needs goes in `shared/`
- Data goes in `data/`

## The pages

### hero/ (landing page)
This page is the first thing that a visitor will see.
- Topbar
- Hero (obviously)
- Example question card
- Feature carousel
- Background doodles

### pricing/
This page is where a visitor can decide their plan.
- Two plans (free, premium)
- Monthly/yearly toggle

### login/ and signup/
This page is where the visitor registers and confirms their account.
- Share one stylesheet (login/login.css)
- Check the form before sending anything (does it have a valid email, password, and at least 8 characters when signing up?)
- Show errors next to the field they belong to
- Show a spinner on the buttom while Supabase is working
- Turn Supabase's errors into readable English i.e invalid_credentials becomes "Email or password is incorrect"

### setup/
The onboarding steps a new user goes through ONCE, after confirming their email.
- Username and pfp
- Year group
- Maths/FM
- Current grade
- Target grade
GCSE students choose from grades 9-1, A level students choose from grades A* to E. Target grades lower than the current grades are greyed out (I mean seriously, why are you trying to revise for a lower grade :sob:). Answers are saved to `profiles` table and picture to `avatars` SB.

### home/ (dashboard)
The main app after logging in that the registered user will use post account creation and post login.

## Shared code
Currently just code for Supabase.

### About the Supabase key
ITS PUBLIC WE ARENT BUFFOONS ITs A PUBLISHABLE KEY

## Accounts and the sign up flow
- Signup calls sb.auth.signUp() with emailRedirectTo: pageUrl("setup") so that the link in the confirmation email opens the setup page already logged in
- For emails that are already registered, supabase hides whether it is to protect against attackers, so when it is, sign up succeeds but returns a user with no identities so we check data.user.identities.length===0 and tell the student to log in instead
- Login calls sb.auth.signInWithPassword() then routeSignedInUser()
- Every protected page checks first, the dashboard runs a check as soon as it loads, so if there's no session, go to login, and a session with no profile means go to setup, which is why `<body>` starts with the class `checking` which hides the page until the check finishes so that nobody sees placeholder content. Smart system ikr
- Logout calls sb.auth.signOut() and goes back to the hero page

## The database
Ingenio uses Supabase with RLS because we aren't buffoons.

### profiles
One row per user created at the end of setup
icba to go into it

### quiz_attempts
icba to go into this either

