import "./TaskTable.css";

const CompletedTaskTable = ({ tasks }) => {
  return (
    <div className="table-container">
      <table className="task-table">

        <thead>
          <tr>
            <th>Client</th>
            <th>Content</th>
            <th>Assigned Date</th>
            <th>Completed Date</th>
          </tr>
        </thead>

        <tbody>
        {tasks.map((task) => (
            <tr key={task.id}>
            <td>{task.client_name}</td>
            <td>{task.content_type}</td>
            <td>{task.assign_date}</td>

            <td>
                {task.completed_at || task.completed_at || "-"}
            </td>
            </tr>
        ))}
        </tbody>

      </table>
    </div>
  );
};

export default CompletedTaskTable;