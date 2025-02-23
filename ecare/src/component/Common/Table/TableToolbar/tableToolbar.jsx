import React from "react";
import PropTypes from "prop-types";
import { Toolbar, Tooltip, Typography, IconButton, alpha } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";

const EnhancedTableToolbar = ({ numSelected, title, selected, handleDelete, setSelected }) => {
  const onDeleteClick = () => {
    if (typeof handleDelete === 'function' && selected.length > 0) {
      handleDelete(selected); // Ensure handleDelete is a valid function
      setSelected([]); // Clear the selected doctors after deletion
    }
  };

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {title}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={onDeleteClick}> {/* Pass selected doctors to delete */}
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  selected: PropTypes.array.isRequired, // Add selected prop
  handleDelete: PropTypes.func.isRequired, // Add handleDelete prop
  setSelected: PropTypes.func.isRequired, // Add setSelected prop
};

export default EnhancedTableToolbar;
