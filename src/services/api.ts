const API_BASE_URL = 'http://192.168.29.27:8000/api';

/* =========================
   GET GROUPS
========================= */

export async function getGroups() {
  const response = await fetch(`${API_BASE_URL}/groups`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/* =========================
   GET GROUP
========================= */

export async function getGroup(groupId: number) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/* =========================
   GET BALANCES
========================= */

export async function getBalances(groupId: number) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/balances`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/* =========================
   GET EXPENSES
========================= */

export async function getExpenses(groupId: number) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/expenses`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/* =========================
   GET SETTLEMENTS
========================= */

export async function getSettlements(groupId: number) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/settlements`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/* =========================
   UPDATE MEMBER
========================= */

export async function updateMember(
  groupId: number,
  memberId: number,
  name: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/members/${memberId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `HTTP ${response.status}`,
    );
  }

  return data;
}

/* =========================
   DELETE MEMBER
========================= */

export async function deleteMember(
  groupId: number,
  memberId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/members/${memberId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `HTTP ${response.status}`,
    );
  }

  return data;
}

/* =========================
   UPDATE EXPENSE
========================= */

export async function updateExpense(
  groupId: number,
  expenseId: number,
  description: string,
  amount: number,
  paidBy: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/expenses/${expenseId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        description: description.trim(),
        amount: Number(amount),
        paid_by: paidBy,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `HTTP ${response.status}`,
    );
  }

  return data;
}

/* =========================
   DELETE EXPENSE
========================= */

export async function deleteExpense(
  groupId: number,
  expenseId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/expenses/${expenseId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `HTTP ${response.status}`,
    );
  }

  return data;
}

