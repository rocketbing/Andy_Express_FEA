# Interview Answer: Adding Urgent Feature at Sprint End

## Short Version (1-2 minutes)

**Question**: "Can you share an experience where you used agile methodology to handle an urgent requirement?"

**Answer**:

In our Andy Express project, when we were at the end of a sprint with only 1 day left until delivery, the business department suddenly requested a new feature: adding date range Excel export functionality to three modules - order flow, return flow, and cancelled orders - because the finance department urgently needed it for monthly reconciliation.

Our team had an emergency standup to discuss this. The challenge was that we had very limited time and the feature affected three different modules, which was a fairly large scope. During the discussion, I analyzed the requirements and realized that although the feature involved three modules, the logic was very similar, so we could reuse components. I proposed a solution to the team: create a reusable date range selection component that all three modules could use, which would significantly reduce development time.

After the team agreed on the approach, I took on the task of creating the reusable date selection component and integrating it into the first module (order flow), while my colleague handled the other two modules. The advantage of this approach was that once the first module was complete, the other modules could quickly replicate the solution, significantly improving efficiency.

I also proactively reached out to the backend developer about the API interface to confirm that we could add date parameters to the existing API, which helped prevent potential blocking issues later.

In the end, we delivered the feature on time, and the code quality remained good because component reuse reduced duplicate code. The business stakeholders were satisfied with the results, and the finance department could immediately use this feature for reconciliation.

This experience taught me the importance of code reuse and componentization thinking - they can significantly improve development efficiency, especially in urgent situations. It also highlighted the importance of early communication and coordination to avoid blocking issues at the last minute.

---

## Detailed Version (for extended answers)

**Question**: "Can you describe this experience in detail? What was your role and contribution?"

**Answer**:

In our Andy Express project, when we were at the end of a sprint with only 1 day left until delivery, the business department suddenly requested a new feature: adding date range Excel export functionality to three modules - order flow, return flow, and cancelled orders. The finance department urgently needed this feature for monthly reconciliation.

**My Role and Actions**:

As a frontend engineer on the team, when this urgent requirement came up, I quickly analyzed the feasibility and workload. Our team had an emergency standup where we discussed the requirement with the Product Owner and business stakeholders. During the meeting, I actively participated in the discussion and shared my technical analysis.

I realized that although the feature involved three modules, each module's requirements were very similar: all needed date pickers, API calls, and Excel export functionality. Since we already had an Excel export utility function in our system, I proposed creating a reusable date range selection component that all three modules could use, which would significantly reduce development time.

During task assignment, I volunteered to take on:
1. Creating the reusable date range selection Modal component (UI layer)
2. Integrating it into the first module (order flow), including API calls, data filtering, and data transformation business logic
3. Reaching out to the backend developer about the API interface to confirm we could add date parameters

My colleague was responsible for integrating the other two modules. The strategy was that I would complete one module first, verify it worked, and then the other two modules could quickly replicate the solution, significantly improving efficiency.

**Challenges and Solutions**:

The first challenge was the tight timeline. My solution was to use incremental delivery - complete one module first, test and demonstrate it immediately, and once confirmed feasible, replicate it to other modules.

The second challenge was ensuring code quality. Since we already had an Excel export utility function, I reused existing code patterns, and the reusable component I created followed the project's coding standards, reducing the risk of introducing bugs.

The third challenge was coordinating with the backend API. I proactively reached out to the backend developer to discuss the API changes, confirming we could add date parameters to the existing API. If the backend couldn't make changes in time, I prepared a backup plan: the frontend would fetch all data first, then filter by date range on the frontend.

**Final Results**:

We delivered the feature on time, and all three modules now support date range Excel export. The code quality remained good because component reuse reduced duplicate code and followed existing coding standards.

The business stakeholders were satisfied with the results, and the finance department could immediately use this feature for monthly reconciliation. More importantly, we didn't impact the delivery of other sprint tasks, and the entire sprint was completed on time.

**My Learnings**:

This experience taught me several important lessons:
1. The importance of code reuse and componentization thinking - they can significantly improve development efficiency, especially in critical moments
2. The importance of early communication and coordination to avoid blocking issues at the last minute
3. The ability to quickly assess, break down tasks, and develop in parallel under urgent circumstances
4. Even with tight timelines, we shouldn't sacrifice code quality - we can ensure quality through reuse and following standards

---

## Key Points to Emphasize

1. **Agile Thinking**: Quickly respond to changes, flexibly adjust plans
2. **Technical Skills**: Code reuse, componentization thinking, parallel development
3. **Communication & Coordination**: Effective communication with backend and business stakeholders
4. **Risk Awareness**: Proactively identify risks and prepare backup solutions
5. **Quality Assurance**: Maintain code quality even under time pressure
6. **Team Collaboration**: Proper task division to maximize team efficiency

---

## Possible Follow-up Questions

**Q: What if the backend couldn't modify the API in time?**  
A: I would use a frontend filtering approach: call the existing API to get all data, then filter by date range on the frontend before exporting. Although performance wouldn't be as good as server-side filtering, it would quickly meet the business needs. I would also document this as a technical debt to be optimized in the next sprint.

**Q: How did you ensure code quality?**  
A: 1) Reused existing, proven code patterns; 2) Created reusable components to reduce duplicate code and potential bugs; 3) Used incremental delivery, testing each module immediately after completion; 4) Code review (even though time was tight, we did at least a quick review); 5) Focused testing on core functionality paths.

**Q: What if you really didn't have enough time?**  
A: I would use an MVP (Minimum Viable Product) strategy: implement the core functionality first (date selection + export), ensuring basic usability. If time allowed, I would add optimizations (like date validation, loading indicators, etc.). I would also communicate with the Product Owner to see if we could adjust priorities or extend the sprint.

**Q: What did you learn from this experience?**  
A: 1) The importance of code reuse and componentization - they can significantly improve efficiency in critical moments; 2) The importance of early backend coordination to avoid last-minute blocking; 3) Practical application of agile methodology, how to stay agile under pressure; 4) The importance of team collaboration and communication; 5) The importance of risk identification and backup solutions.
