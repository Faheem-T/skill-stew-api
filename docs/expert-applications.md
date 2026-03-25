# Expert Applications

This document captures the current design direction for the expert application feature.

## Decision

The chosen approach is an authenticated application flow.

An applicant must first register and authenticate. The system creates the user with role `EXPERT_APPLICANT`. Once the application is approved, the user's role is promoted to `EXPERT`.

This is preferred over an anonymous application flow because it guarantees ownership of the email address, reduces spam, and gives the system tighter control over the onboarding lifecycle.

## Rejected Approach

### Anonymous applications

Flow:

Expert applies with an email -> Admin reviews ->  
If approved: create user + create expert profile + send one-time password email ->  
If rejected: send rejection email

Why this was rejected:

- The applicant could submit an email they do not own.
- Email verification would have to be bolted onto an otherwise unauthenticated flow.
- The approval path becomes awkward because account creation happens late.
- It introduces more edge cases around duplicate emails and account linking.

The main benefit was that unapproved applicants would not create rows in the user domain. That benefit is not worth the tradeoff.

## Chosen Flow

### Registration and submission

1. User registers.
2. System creates a user with role `EXPERT_APPLICANT`.
3. System creates an expert application record linked to that user.
4. Applicant fills and submits the expert application.
5. Application status becomes `PENDING`.

### Admin review

For the current iteration, review is single-step:

- `APPROVE`
- `REJECT`

There is no resubmission or "request changes" flow yet.

### Approval path

When an admin approves an application, the system should:

1. Change the user's role from `EXPERT_APPLICANT` to `EXPERT`.
2. Mark the application as `APPROVED`.
3. Create the expert profile from the approved application data.
4. Emit the relevant domain event(s).
5. Update Elasticsearch so the user becomes discoverable as an expert.
6. Notify the applicant through email and real-time delivery.

### Rejection path

When an admin rejects an application, the system should:

1. Mark the application as `REJECTED`.
2. Notify the applicant through email and real-time delivery.
3. Keep the user in role `EXPERT_APPLICANT`.

For now, a rejected applicant cannot reapply. Reapplication may be added later.

## Application Lifecycle

The current status model is intentionally small:

- `PENDING`
- `APPROVED`
- `REJECTED`

Notes:

- There is no separate `NOT_DONE` state in the current plan. Draft or incomplete form state can be handled outside the final application status model if needed.
- There is no `UNDER_REVIEW`, `NEEDS_CHANGES`, or `WITHDRAWN` state in the first iteration.

## Data Model Direction

The exact schema still needs to be defined, but the following fields belong to the expert application domain and will likely seed the expert profile on approval:

- `bio`
- `credentials`
- `portfolioLinks`
- `identityProof`

The expert application and the expert profile are two separate things.

That means:

- The application is the reviewable submission made by an `EXPERT_APPLICANT`.
- The expert profile is created only after approval.
- Approval includes a promotion step from application data into the expert profile model.

This separation is cleaner because application-only concerns such as review status, rejection reason, and future resubmission logic do not have to leak into the long-lived expert profile.

## Why This Fits The Current System

This approach aligns well with the existing architecture:

- Role-driven auth already exists, so the system can gate expert-only routes after approval.
- Admin review can follow the same use-case-driven pattern used elsewhere in the user service.
- Approval side effects fit the existing event-driven design: write domain data, emit outbox event(s), let downstream consumers update Elasticsearch and notifications.

## Required Implementation Implications

The current codebase does not yet recognize `EXPERT_APPLICANT`, so this approach requires role model changes across the system.

At minimum, these areas will need updates:

- User role definitions in the user service
- User role definitions in the gateway
- JWT signing and verification logic for the new role
- Route authorization rules that should admit or exclude `EXPERT_APPLICANT`
- Current-user/profile resolution logic, since the system currently only branches on `USER | EXPERT | ADMIN`
- Elasticsearch indexing/event contracts for expert approval
- Expert application persistence and expert profile creation flow

## Tradeoff

The main downside of the chosen approach is that rejected applicants still exist in the system as authenticated users.

That is acceptable for now because:

- The identity is verified.
- The audit trail is useful.
- The model is simpler and safer than late account creation.

If this becomes noisy later, cleanup or archival policies can be added without changing the core workflow.

## A new `EXPERT_APPLICANT` role or a `application_accepted` flag on expert profile

I considered either:

- adding an `application_accepted` flag on the expert profile
- introducing a dedicated `EXPERT_APPLICANT` role

The decision is to introduce the new role.

### Adding the new role

Pros:

- Keeps `EXPERT`s clean and separate from applicants
- Makes it easy to block applicant access to expert-only functionality through role checks
- Works well with the current JWT model, since the user's role is already stored in the access token and can be enforced at the gateway
- Can also ensure only `EXPERT_APPLICANT`s can submit applications.

Cons:

- Need to update the `UserRoles` in every service that references it
- Gateway updates are also required

### Adding a `application_accepted` flag to the expert profile

Pros:

- No need to add a new role
- Simpler to make this change

Cons:

- Will have to check this flag whenever doing something that only verified experts should be able to do
- That would likely require an extra database lookup for expert-only actions if the approval state is not already present in the token
- Since verified experts will eventually have far more actions than applicants, this would push repeated approval checks into a large part of the system

### Decision

The extra per-request approval check is not worth the cost or complexity. It is better to accept the one-time implementation overhead of updating `UserRoles` across services in exchange for a clean separation between an applicant and a verified expert.

## Future Enhancements

Possible later additions:

- Reapplication after rejection
- Request-changes / needs-more-info review path
- Richer review audit trail
- More explicit draft state before submission
- Strongly typed expert application and expert profile schemas
