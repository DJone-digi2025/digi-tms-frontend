import "./TaskTable.css";

const CompletedTaskTable = ({ tasks }) => {
  return (
    <div className="table-container">
      <table className="task-table">

<thead>
  <tr>
    <th>Task Code</th>
    <th>Description</th>
    <th>Plan</th>
    <th>File</th>
    <th>Assigned Date</th>
    <th>Completed Date</th>
  </tr>
</thead>

<tbody>
  {tasks.map((task) => (
    <tr key={task.id}>

      <td>{task.task_code}</td>

      <td>{task.description || "-"}</td>

      <td>
        {task.plan_link ? (
          <a href={task.plan_link} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : "-"}
      </td>

      <td>
        {task.plan_file ? (
          <a href={task.plan_file} target="_blank" rel="noopener noreferrer">
            File
          </a>
        ) : "-"}
      </td>

      <td>{task.assign_date}</td>

      <td>{task.completed_at || "-"}</td>

    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
};

export default CompletedTaskTable;