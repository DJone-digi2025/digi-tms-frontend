import axios from "axios";
import { supabase } from "../supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================
   EMPLOYEE APIs
========================= */

// 🔥 Active Tasks
export const getDesignerActiveTasks = async (user) => {
  const response = await axios.get(
    `${BASE_URL}/tasks/designer/active`,
    {
      params: {
        user_id: user.id,
        user_name: user.name,
        user_role: user.role
      }
    }
  );
  return response.data;
};

// 🔥 Completed Tasks (History)
export const getDesignerHistory = async (user) => {
  const response = await axios.get(
    `${BASE_URL}/tasks/designer/history`,
    {
      params: {
        user_id: user.id,
        user_name: user.name,
        user_role: user.role
      }
    }
  );
  return response.data;
};

export const getManagerHistory = async (filters) => {
  const res = await axios.get(`${BASE_URL}/tasks/manager/history`);
  return res.data;
};

// 🔥 Save Delay Reason
export const saveDelayReason = async (taskId, comment, userRole) => {
  const response = await axios.patch(
    `${BASE_URL}/tasks/${taskId}/save-reason`,
    {
      comment,
      user_role: userRole
    }
  );

  return response.data;
};

export const saveComment = async (taskId, comment, userRole) => {
  const res = await axios.patch(
    `${BASE_URL}/tasks/${taskId}/save-reason`,
    {
      comment,
      user_role: userRole
    }
  );
  return res.data;
};

// 🔥 Submit Task
export const submitTask = async (task_id, reason_for_delay) => {
  const response = await axios.post(
    `${BASE_URL}/submit-task`,
    {
      task_id,
      reason_for_delay
    }
  );
  return response.data;
};

/* =========================
   MANAGER APIs
========================= */

// 🔥 Get Manager Tasks
export const getManagerTasks = async (params) => {
  const response = await axios.get(
    `${BASE_URL}/tasks/manager`,
    { params }
  );
  return response.data;
};

// 🔥 Approve Task
export const approveTask = async (taskId) => {
  const response = await axios.post(
    `${BASE_URL}/approve-task`,
    { task_id: taskId }
  );
  return response.data;
};

// 🔥 Rework Task
export const reworkTask = async (taskId, comment) => {
  const response = await axios.post(
    `${BASE_URL}/rework-task`,
    {
      task_id: taskId,
      manager_comment: comment,
    }
  );
  return response.data;
};


/* =========================
   COMMON APIs
========================= */

// 🔥 Team Members
export const getTeamMembers = async () => {
  const response = await axios.get(
    `${BASE_URL}/team-members`
  );
  return response.data;
};

export const getEmployeeAllTasks = async (userId) => {
  const response = await axios.get(
    `${BASE_URL}/tasks/designer/all?user_id=${userId}`
  );
  return response.data;
};

export const getAllTasks = async () => {
  const response = await axios.get(`${BASE_URL}/tasks/all`);
  return response.data;
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/create-manual-task`, // 🔥 HARD-CODED
      taskData
    );
    return response.data;
  } catch (error) {
    console.error("Create Task API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const cancelTask = async (taskId) => {
  const response = await axios.post(
    `${BASE_URL}/cancel-task`,
    { task_id: taskId }
  );
  return response.data;
};

export const markTaskLow = async (taskId, emergencyTaskId) => {
  const response = await axios.post(
    `${BASE_URL}/mark-task-low`,
    {
      task_id: taskId,
      emergency_task_id: emergencyTaskId
    }
  );
  return response.data;
};

export const createBill = async (data) => {
  const res = await axios.post(
    `${BASE_URL}/create-bill`,
    data
  );
  return res.data;
};

export const getBills = async () => {
  const res = await axios.get(
    `${BASE_URL}/billing`
  );
  return res.data;
};

export const updatePayment = async (billId, amount) => {
  const res = await axios.post(
    `${BASE_URL}/update-payment`,
    {
      bill_id: billId,
      amount_paid: amount
    }
  );
  return res.data;
};

export const createMeeting = async (data) => {
  const res = await axios.post(
    `${BASE_URL}/create-meeting`,
    data
  );
  return res.data;
};

export const getMeetings = async () => {
  const res = await axios.get(
    `${BASE_URL}/meetings`
  );
  return res.data;
};

export const completeMeeting = async (id) => {
  const res = await axios.post(
    `${BASE_URL}/complete-meeting`,
    { meeting_id: id }
  );
  return res.data;
};

export const updatePlanLink = async (data) => {
  const res = await axios.post(`${BASE_URL}/update-plan-link`, data)
  return res.data;
};

export const getClients = async () => {
  const res = await fetch(`${BASE_URL}/clients`);
  const data = await res.json();
  return data;
};

/* =========================
   REASSIGN APIs
========================= */

// 🔥 Get Team Stats
export const getTeamStats = async () => {
  const res = await axios.get(
    `${BASE_URL}/team-stats`
  );
  return res.data;
};

// 🔥 Reassign Task
export const reassignTask = async (taskId, userId) => {
  const res = await axios.put(
    `${BASE_URL}/reassign-task/${taskId}`,
    {
      new_user_id: userId
    }
  );
  return res.data;
};

export const uploadPlanCSV = async (file, user_name, user_role) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_name", user_name);
  formData.append("user_role", user_role);

  const res = await fetch(`${BASE_URL}/upload-plan`, {
    method: "POST",
    body: formData
  });

  return res.json();
};

export const uploadPlanFile = async (file) => {
  const fileName = `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from("plans")
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("plans")
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
};

export const cancelMeeting = async (id) => {
  const res = await axios.put(`${BASE_URL}/cancel-meeting/${id}`);
  return res.data;
};

export async function getAssignDatePreview(data) {
  const res = await fetch(`${BASE_URL}/preview-assign-date`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export const publishTask = async (task_id) => {
  const response = await axios.post(
    `${BASE_URL}/publish-task`,
    { task_id }
  );
  return response.data;
};

export const pauseTasks = async (taskIds, pause) => {
  const res = await axios.post(
    `${BASE_URL}/tasks/pause`,
    {
      task_ids: taskIds,
      pause
    }
  );
  return res.data;
};

export const pauseUsers = async (userIds, pause) => {
  const res = await axios.post(
    `${BASE_URL}/users/pause`,
    {
      user_ids: userIds,
      pause
    }
  );
  return res.data;
};

export const setPriorityOverride = async (taskId, priority) => {
  const res = await axios.post(
    `${BASE_URL}/tasks/priority-override`,
    {
      task_id: taskId,
      priority
    }
  );
  return res.data;
};
