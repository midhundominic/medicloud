import React, { useState } from 'react';
import './dynamicForm.css'

const DynamicForm = ({ onSave }) => {
  const [fields, setFields] = useState([{ label: '', value: '', unit: '' }]);

  // Handle input changes
  const handleFieldChange = (index, e) => {
    const newFields = [...fields];
    newFields[index][e.target.name] = e.target.value;
    setFields(newFields);
  };

  // Add new field
  const handleAddField = () => {
    setFields([...fields, { label: '', value: '', unit: '' }]);
  };

  // Remove a field
  const handleRemoveField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(fields);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <input
            name="label"
            placeholder="Field Name"
            value={field.label}
            onChange={(e) => handleFieldChange(index, e)}
            required
          />
          <input
            name="value"
            placeholder="Value"
            value={field.value}
            onChange={(e) => handleFieldChange(index, e)}
            required
          />
          <input
            name="unit"
            placeholder="Unit (optional)"
            value={field.unit}
            onChange={(e) => handleFieldChange(index, e)}
          />
          <button type="button" onClick={() => handleRemoveField(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddField}>Add Field</button>
      <button type="submit">Save Record</button>
    </form>
  );
};

export default DynamicForm;