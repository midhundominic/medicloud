import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { combineStyles } from "../../../utils/combineStyleUtil";
import internalStyles from "./autoComplete.module.css";

const AutoCompleteInput = ({
  options,
  label,
  disablePortal = false,
  styles: customStyles,
  handleChange = () => {},
  value,
}) => {
  const styles = combineStyles(internalStyles, customStyles);

  return (
    <Autocomplete
      classes={{ root: styles.root }}
      value={value}
      onChange={handleChange}
      size="small"
      disableClearable={true}
      options={options || []}
      getOptionLabel={(option) => {
        if (!option) return "";
        if (typeof option === "string") return option;
        return option.label || "";
      }}
      filterOptions={(options, { inputValue }) => {
        if (!inputValue) return options;
        const searchTerm = inputValue.toLowerCase();
        return options.filter((option) => {
          if (!option || !option.label) return false;
          return option.label.toLowerCase().includes(searchTerm);
        });
      }}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <li key={key} {...otherProps}>
            {option.label}
          </li>
        );
      }}
      sx={{ 
        width: 300,
        '& .MuiAutocomplete-endAdornment': {
          display: 'none'
        },
        '& .MuiAutocomplete-popupIndicator': {
          display: 'none'
        },
        '& .MuiAutocomplete-clearIndicator': {
          display: 'none'
        }
      }}
      disablePortal={true}
      renderInput={(params) => {
        const { InputProps, ...rest } = params;
        const { endAdornment, ...otherInputProps } = InputProps;
        return (
          <TextField
            {...rest}
            InputProps={otherInputProps}
            label={label}
            classes={{ root: styles.textRoot }}
            variant="outlined"
          />
        );
      }}
      openOnFocus
      disableCloseOnSelect={false}
    />
  );
};

export default AutoCompleteInput;