-- Seed data for local development
-- Run this after schema.sql to populate test data.

-- NOTE: These UUIDs are for dev only. In production, profiles are created
-- automatically when a user signs up via the auth.users trigger.

-- Insert a test profile (replace with a real auth.users UUID in your Supabase project)
INSERT INTO public.profiles (id, email, display_name, analyses_count)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'dev@electricresume.com',
    'Dev User',
    4
) ON CONFLICT (id) DO NOTHING;

-- Insert sample analyses
INSERT INTO public.analyses (user_id, job_title, company_name, score, matched_skills, missing_skills, suggestions, jd_snippet)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Senior Frontend Engineer',
    'Acme Corp',
    90,
    ARRAY['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    ARRAY['GraphQL', 'AWS'],
    '{"summary": {"issue": "Summary lacks backend mention.", "improvement": "Add full-stack context."}, "experience": {"issue": "Good detail on frontend.", "improvement": "Quantify achievements more."}, "skills": {"issue": "Missing cloud skills.", "improvement": "Add AWS or GCP experience."}}',
    'We are looking for a Senior Frontend Engineer with 5+ years of experience in React, Next.js, and TypeScript...'
),
(
    '00000000-0000-0000-0000-000000000001',
    'Full Stack Developer',
    'TechStart Inc',
    75,
    ARRAY['JavaScript', 'Node.js', 'PostgreSQL'],
    ARRAY['Python', 'FastAPI', 'Docker'],
    '{"summary": {"issue": "Too generic.", "improvement": "Tailor to full-stack role."}, "experience": {"issue": "Frontend-heavy.", "improvement": "Highlight backend projects."}, "skills": {"issue": "Missing Python stack.", "improvement": "Add Python/FastAPI if applicable."}}',
    'Full Stack Developer needed for a fast-growing startup. Must have experience with modern JavaScript...'
),
(
    '00000000-0000-0000-0000-000000000001',
    'React Developer',
    'DesignFlow',
    85,
    ARRAY['React', 'CSS', 'Figma', 'Storybook'],
    ARRAY['Vue.js', 'Testing Library'],
    '{"summary": {"issue": "Strong but could be more specific.", "improvement": "Mention design system experience."}, "experience": {"issue": "Great project descriptions.", "improvement": "Add metrics."}, "skills": {"issue": "Consider adding testing.", "improvement": "Highlight unit testing experience."}}',
    'We need a React Developer passionate about building beautiful, accessible user interfaces...'
),
(
    '00000000-0000-0000-0000-000000000001',
    'Software Engineer II',
    'MegaCorp',
    60,
    ARRAY['Java', 'Spring Boot'],
    ARRAY['Kubernetes', 'Microservices', 'Kafka', 'System Design'],
    '{"summary": {"issue": "Lacks system design focus.", "improvement": "Emphasize distributed systems."}, "experience": {"issue": "Too many responsibilities listed.", "improvement": "Focus on 3-4 high-impact achievements."}, "skills": {"issue": "Significant gaps.", "improvement": "Add cloud-native and messaging skills."}}',
    'Software Engineer II for our platform team. Requires expertise in distributed systems, microservices...'
);
