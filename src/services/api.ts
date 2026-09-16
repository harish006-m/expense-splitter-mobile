const API_BASE_URL = 'http://192.168.29.27:8000/api';

export async function getGroups() {
  const response = await fetch(`${API_BASE_URL}/groups`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function getGroup(groupId: number) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function getBalances(groupId: number) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/balances`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function getExpenses(groupId: number) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/expenses`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `HTTP ${response.status}`,
    );
  }

  return data;
}

/* =========================
   DELETE GROUP
========================= */

export async function deleteGroup(groupId: number) {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
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