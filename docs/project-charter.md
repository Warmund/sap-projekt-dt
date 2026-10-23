# Project Charter

**Project Name:** Workflow und Datenbank für sanktionierte Geschäftspartner (SAP SE, Export Control)
**Author:** <Author>

## Change log

| Author | Date            | Change          | Version |
| ------ | --------------- | --------------- | ------- |
| xx     | Mar, 11th 2016  | Initial Version | 0.1     |
| Agent  | Oct, 16th 2026  | Template adapted to SAP (LH references replaced), project name set | 0.2 |
| Agent  | Oct, 23rd 2026  | Technical constraints added (stack, local Docker operation, mock data instead of GTS API; see docs/infrastructure.md) | 0.3 |
| Agent  | Oct, 23rd 2026  | Non-goal added: no real e-mail sending in the MVP | 0.4 |

## 1 Project Purpose or Justification

> <Please describe briefly the goal(s) of the project>

The aim of the project is ….

### 1.1 Project Statement of Work

> <Please provide a narrative description of products, services or results to be delivered by the project. This description has to include:
>
> - The Product scope description, i.e. the characteristics of the product, service or result that the project will deliver
> - The business need, i.e. the market demand, the cost reduction, the product improvement, the customer benefit, the legal requirement, the governmental regulation, or the environmental consideration that justifies the project
> - The alignment with strategic plan of SAP SE or the business unit (Export Control)>

After the project there will be…
For this … will be established.
On top … will be built and staffed.

Key-Deliverables of the project:

- XX
- XX
- XX
- XX
- …

### 1.2 Measurable Project Objectives and Related Success Criteria

> <please describe how the success of the project can be measured, e.g. cost reduction by x%, improvement of CPI by y%>

The project is successful if the following goals have been achieved:

- XX
- XX
- XX

### 1.3 Other Success Criteria

> <Please describe other non-measurable success criteria>

## 2 Assumptions and Constraints

> <Please describe relevant assumptions and constraints for the project, e.g.
>
> - A hard deadline that has to be met
> - A budget constraint
> - A staffing constraint
> - Non Goals>

- XX
- XX
- XX
- Technical constraint: no API connection to SAP GTS in this project; the dashboard and workflow run on mock data (agreed in meeting 1).
- Technical constraint: the solution is a single Next.js full-stack application (UI5 Web Components for React, Prisma, PostgreSQL), operated locally via Docker Compose; no cloud/BTP deployment. Details: `docs/infrastructure.md`.
- Non-goal: no real e-mail sending in the MVP. Notifications to teams are only indicated by a (non-functional) "send mail" button.

## 3 Business Case

> <Please explain the logic of the business case for the project. Typically the business case is driven by one or more of the following:
>
> - Market demand
> - Organizational need, e.g. reduction of overhead cost requires better automation of a process
> - Customer need
> - Technological advance
> - Legal requirements, e.g. enhanced data protection requirements
> - Regulatory requirements, e.g. new or changed sanctions regulations (EU, US, UN)
> - Reduction of ecological impact>
>
> - Estimates for business benefits
> - Estimates for project costs
> - Estimates for future operations costs
> - If a WiRe has already been calculated, please include here as a link>

## 4 High-level Risks

> <Please outline the top risks of this project. Focus on project specific risks instead of generic risks that apply to all projects.>

- Organisational Risks
- Environmental Risks
- Financial Risks
- Technical Risks
- Functional Risks
- Schedule Risks
- Etc.

## 5 Stakeholders and Governance

### 5.1 Project Sponsor

> <Please name the stakeholder who is the customer or the main beneficiary of this project and thus usually responsible for the business case>

### 5.2 Project Owner

> <Please name the stakeholder who is main responsible for IT subjects of the project.>

### 5.3 Project Manager(s)

> <Please name the stakeholders who is responsible to ensure a successful and timely completion of the project. In case there are a business project manager and an IT project manager, name both>

### 5.4 Other Relevant Stakeholders

> <Which other groups inside and outside SAP SE are positively or negatively impacted by the project?> Examples:
>
> - SAP Employees
> - SAP Works council
> - Process (Domain) Owner of impacted processes
> - Supplier of the existing solution
> - Potential suppliers of a new solution
> - Functional Department
> - Users
> - Client
> - Public Authorities
> - Workers' participation
> - Legislative Authorities
> - Unions>

### 5.5 Project Governance

The project manager and the stakeholders will agree on the project's governance structure.
The following aspects of the project's governance are pre-defined at the time of the project initiation:

> <Are there any specific agreements on the project governance that are known at project initiation?:
>
> - Review Board
> - Pre-assigned attendees and their roles and responsibilities
> - Part of a Program?
> - Is the project part of a program with a defined governance structure?
>
> Description of the individual function>

## 6 High Level Milestone Plan

The following timeline is a very high level view valid at the initiation of the project. It will be refined during planning phase. Based on the scope refinement and the results of the assessments done in the planning phase the actual project plan can deviate significantly from this high level milestone plan. A reliable project plan will only be available after the results of the planning phase are approved.

| Project Phase            | Start        | End        |
| ------------------------ | ------------ | ---------- |
| Initialization           | <start date> | <end date> |
|                          | <start date> | <end date> |
|                          | <start date> | <end date> |
| Preparation              | <start date> | <end date> |
|                          | <start date> | <end date> |
|                          | <start date> | <end date> |
| Implementation & Closure | <start date> | <end date> |
|                          | <start date> | <end date> |
|                          | <start date> | <end date> |

If a hard deadline has to be met because of external dependencies this deadline is listed in section 2, Assumptions and Constraints.

## 7 Project Team

### 7.1 Organization Chart

Chart

Statement about staffing / team members (if applicable)

### 7.2 Pre-assigned Resources

> <list all resources that are pre-assigned to the project; list only resources with more than 0,5 FTE>

The following resources are pre-assigned to the project. Note that this lists only pre-assigned resources that are planned to be part of the project team at time of project initiation. The project's staffing plan will be developed as part of the project planning process.

| Name   | Dep. | Role | Start        | End        | FTE |
| ------ | ---- | ---- | ------------ | ---------- | --- |
| <Name> |      |      | <start date> | <end date> |     |
| <Name> |      |      | <start date> | <end date> |     |
| <Name> |      |      | <start date> | <end date> |     |
| <Name> |      |      | <start date> | <end date> |     |

## 8 Other Agreements

none <change if required>

## 9 Project authorization

This document formally authorizes the project "Workflow und Datenbank für sanktionierte Geschäftspartner" to implement the scope described in section 1.1.

A project management plan will be developed and submitted for approval. This plan will include: scope statement, schedule, cost estimate, budget and provisions for scope, resource, schedule, communications, quality, risk, procurement and stakeholder management as well as project control. The project will be implemented according to the following standards: PMBOK, <applicable SAP / Frankfurt UAS project guidelines – to be clarified with SAP>.

<Name Sponsor> is the main sponsor of this project. She/he is responsible for developing the business case as well as assigning the required resources from the business side.

<Name Project Owner> is the main responsible for IT subjects of the project. She/he will assign the required IT resources and supervise the correct implementation of all applicable IT standards.

<Name PMs> is appointed as project manager of the project. She/he is hereby authorized to interface with management as required, negotiate for resources, delegate responsibilities within the project framework, and communicate with all contractors and management as required to ensure a successful and timely completion of the project.

| Role                  | Date | Signature |
| --------------------- | ---- | --------- |
| Project Sponsor       |      |           |
| Project Owner         |      |           |
| Project Manager (IT)  |      |           |
| Product Owner (BU)    |      |           |
