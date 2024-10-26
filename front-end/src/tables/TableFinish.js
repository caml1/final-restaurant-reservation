import React from "react";
import ErrorAlert from "../layout/ErrorAlert";

const TableFinish = ({ table, clickHandler, error }) => {
  return (
    table.reservation_id && (
      <div>
        <ErrorAlert error={error} />
        <button
          className="btn btn-danger"
          type="button"
          onClick={(e) => clickHandler(e, table.table_id)}
          data-table-id-finish={table.table_id} // Ensure this is set correctly for testing
        >
          Finish
        </button>
      </div>
    )
  );
};

export default TableFinish;