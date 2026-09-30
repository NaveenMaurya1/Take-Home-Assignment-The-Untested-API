BUG -:1

Bug: Pagination skips the first page.

Expected: GET /tasks?page=1&limit=10 should return the first 10 tasks.

Actual: It starts from the 11th task and returns only the remaining tasks when fewer than 10 remain.

Cause: getPaginated() calculates the offset using page * limit instead of (page - 1) * limit.

Impact: Every requested page is shifted by one page. Page 1 skips the first 10 tasks.