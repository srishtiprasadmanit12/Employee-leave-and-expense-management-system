User
---------
_id
name
email
password
role
department
designation
managerId

Leave
---------
_id
employeeId
leaveType
startDate
endDate
reason
status
approvedBy

Expense
---------
_id
employeeId
amount
category
description
receiptUrl
status
approvedBy

Notification
---------
_id
userId
title
message
isRead

AuditLog
---------
_id
action
performedBy
targetId
