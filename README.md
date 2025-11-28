# Table & Form Duplicator Tool

## Overview

The **Table & Form Duplicator** is a powerful web-based tool designed to duplicate table structures and forms within the GAB Platform. It provides an intuitive interface for copying tables with their fields, custom field types, and associated forms, including complex form logic and conditional rules.

## Features

### Core Capabilities

- **Table Structure Duplication**: Clone entire table structures with all custom fields
- **Field Mapping & Transformation**: Remap field keys and transform field types during duplication
- **Form Duplication**: Copy forms with complete layout preservation including:
  - Multiple tabs with custom layouts
  - Header fields
  - Design elements (HTML/style options)
  - FormRules with conditional logic
- **Smart Field Filtering**: Automatically excludes:
  - System fields (id, datecreated, datemodified, createdby, modifiedby)
  - Relationship fields
  - Formula fields
  - Lookup fields (external table references)
- **Interactive Field Editor**: Edit field names and types before duplication
- **Selective Form Duplication**: Choose which forms to duplicate via checkboxes

### Technical Features

- **Field Key Remapping**: Automatically maps old field keys to new field keys for form integrity
- **FormRules Support**: Preserves conditional show/hide/require logic
- **External Dependency Handling**: Intelligently excludes features requiring external resources:
  - EmbeddedReports (reference other tables)
  - EmbeddedForms (reference other tables)
  - DataFilters (can be added post-creation)
- **Dropdown Value Preservation**: Fetches and copies ENUM/ENUM2 field options
- **Payload Validation**: Built-in validation to catch common API issues
- **Technical Mode**: Toggle to show/hide API testing tools

## Installation & Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Access to the GAB Platform
- Valid user token with appropriate permissions

### Configuration

1. **User Token**: The tool automatically retrieves your encrypted token from localStorage
   ```javascript
   // Token is decrypted using AES encryption
   const encryptedToken = localStorage.getItem("token");
   userToken = CryptoJS.AES.decrypt(encryptedToken, aesKEY).toString(CryptoJS.enc.Utf8);
   ```

2. **API Endpoint**: Set to GAB Platform production server
   ```javascript
   const SERVER_URL_PAGE = "https://api.ignatius.io";
   ```

## Usage Guide

### Basic Workflow

1. **Select Source Table**
   - Enter Source Application Key
   - Click "Load Tables" to fetch available tables
   - Select the table you want to duplicate

2. **Review & Edit Fields**
   - View all fields that will be duplicated
   - Edit field names inline
   - Change field types via dropdown
   - System fields, relationships, formulas, and lookups are automatically filtered out

3. **Select Forms (Optional)**
   - Review available forms in the source table
   - Check the boxes next to forms you want to duplicate
   - Click "View Structure" to inspect form details

4. **Configure Destination**
   - Enter Destination Application Key
   - Click "Lookup" to verify the application
   - Enter New Table Name
   - Enter Singular Name for records

5. **Duplicate**
   - Click "Duplicate Table" to start the process
   - Monitor progress in console
   - Review success/failure summary

### Field Type Support

The tool supports conversion between these field types:

| Field Type | Display Name | Description |
|------------|--------------|-------------|
| `VARCHAR` | Text (Short) | Short text field |
| `TEXT` | Text (Long) | Long text field |
| `LONGTEXT` | Text (Very Long) | Very long text field |
| `INT` | Number (Integer) | Whole numbers only |
| `DOUBLE` | Number (Decimal) | Numbers with decimals |
| `DECIMAL` | Number (Precise) | Precise decimal numbers |
| `TINYINT(1)` | Checkbox | True/False checkbox |
| `DATE` | Date | Date only |
| `DATETIME` | Date & Time | Date and time |
| `ENUM` | Dropdown | Single selection dropdown |
| `EMAIL` | Email | Email address |
| `PHONE` | Phone | Phone number |
| `URL` | URL | Web address |

## Technical Architecture

### Form Transformation Pipeline

```
Source Form → Load Structure → Transform → Validate → Create
                    ↓              ↓          ↓
              Field Mapping   Clean Data   Check
              Tab Mapping    Remove Nulls  Structure
              Rules Mapping  Fix Undefined Issues
```

### Key Functions

#### Table & Field Creation

- **`createTableInDestination(tableName, singularName)`**: Creates new table via API
- **`createFieldInTable(sourceField, targetTableKey)`**: Creates individual fields with value fetching
- **`fetchDropdownValues(fieldKey)`**: Retrieves ENUM/ENUM2 options

#### Form Duplication

- **`createFormInTable(sourceFormKey, targetTableKey)`**: Orchestrates form creation
- **`loadFormStructureForDuplication(formKey)`**: Loads complete form structure
- **`transformFormStructure(sourceForm, targetTableKey)`**: Main transformation function

#### Form Transformation Functions

- **`transformTabData(tabData, targetTableKey)`**: Transforms tab structure
- **`transformFormColumn(column, targetTableKey)`**: Transforms individual fields
- **`transformFormFieldSetting(setting, newFieldKey)`**: Transforms field settings
- **`transformHeaderFields(headerFields, targetTableKey)`**: Transforms header fields
- **`transformFormRules(formRules)`**: Transforms conditional rules
- **`transformFormConditionGroups(conditionGroups)`**: Transforms "IF" conditions
- **`transformFormRuleConditions(ruleConditions)`**: Transforms "THEN" actions

#### Utility Functions

- **`mapFieldKey(sourceKey)`**: Maps old field keys to new ones
- **`cleanUndefinedValues(obj)`**: Recursively removes undefined values
- **`validateFormPayload(payload)`**: Validates form structure before submission

### Data Structures

#### Field Key Mapping
```javascript
fieldKeyMapping = {
  "old_field_key_1": "new_field_key_1",
  "old_field_key_2": "new_field_key_2",
  // ... maps all created fields
}
```

#### Form Payload Structure
```javascript
{
  ApplicationTableKey: "target_table_key",
  Name: "Form Name",
  Description: "Form description",
  DefaultForm: 0,
  Type: "web",
  HeaderFields: [...],
  TabData: [
    {
      Order: 0,
      Title: "Tab Name",
      Columns: [...],
      Sections: [...],
      Footer: [...]
    }
  ],
  FormRule: [
    {
      FormRuleIndex: 0,
      Name: "Rule Name",
      FormConditionGroups: [...],
      FormRuleConditions: [...]
    }
  ],
  // Excluded: EmbeddedReports, EmbeddedForms, DataFilters
}
```

#### FormRule Structure
```javascript
{
  FormRuleIndex: 0,
  IsFormRuleActive: true,
  Name: "Rule Name",
  FormConditionGroups: [  // "IF" conditions
    {
      ConditionType: "AND/OR",
      FormGroups: [
        {
          ConditionType: "AND/OR",
          Conditions: [
            {
              FieldKey: "mapped_field_key",
              Operator: "equals/contains/...",
              Operand: "value",
              Value: "comparison_value"
            }
          ]
        }
      ]
    }
  ],
  FormRuleConditions: [  // "THEN" actions
    {
      Action: "hide/show/require/...",
      Type: "field/tab",
      Value: "mapped_field_key",
      FieldKey: "mapped_field_key",
      DisplayMessage: "...",
      IsTrue: true/false,
      PreventSave: true/false
    }
  ]
}
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/Application/getall` | GET | Retrieve applications |
| `/api/applicationtable/getbyapplicationid` | GET | Get tables by app key |
| `/api/applicationtable` | POST | Create new table |
| `/api/Field/getbytableid` | GET | Get fields by table key |
| `/api/Field/getdropdownvalues` | GET | Get ENUM dropdown values |
| `/api/Field` | POST | Create new field |
| `/api/form/getbytableid` | GET | Get forms by table key |
| `/api/form/loadformtoedit` | GET | Load complete form structure |
| `/api/Form` | POST | Create new form |

## Features Excluded from Duplication

The following features are intentionally excluded because they require external dependencies:

### ❌ Excluded Features

1. **EmbeddedReports**
   - Reference other tables not being duplicated
   - Can be manually configured after creation

2. **EmbeddedForms**
   - Reference other tables/forms
   - Can be added post-duplication

3. **FormPdfMaps**
   - PDF mapping configurations
   - Can be set up later

4. **DataFilters**
   - Pre-configured filters
   - Can be added as needed

5. **ApplicationRoleForms**
   - Role-based permissions
   - Should be configured based on destination app

### ✅ Included Features

1. **FormRules**
   - Conditional show/hide/require logic
   - Field-based conditions and actions
   - **Why it works**: Only references fields within the same form

2. **Form Layout**
   - Multiple tabs
   - Field positioning
   - Section organization

3. **HTML/Design Elements**
   - Text blocks
   - Headers
   - Custom styling

4. **Field Settings**
   - Required/Hidden/Readonly flags
   - Validation rules
   - Default values

## Technical Mode (API Testers)

Toggle "Technical Mode" to access API testing tools:

### Available Testers

1. **Application Lookup**
   - Test `/api/Application/getall`
   - Search by App Key or App ID
   - View filtered results

2. **Get Application Tables**
   - Test `/api/applicationtable/getbyapplicationid`
   - View table count and details

3. **Get Table Fields**
   - Test `/api/Field/getbytableid`
   - Inspect field types and properties

4. **Create Field**
   - Test `/api/Field` POST
   - Load sample payloads
   - Validate field creation

## Error Handling

### Field Creation Errors

```javascript
// Tracks success/failure for each field
fieldResults.push({ 
  success: true/false, 
  field: fieldName, 
  fieldType: fieldType,
  result: apiResponse / error: errorMessage 
});
```

### Form Creation Errors

```javascript
// Common 500 errors often indicate:
// 1. Undefined values in payload
// 2. Missing required field keys
// 3. Invalid ConditionGroup structure
// 4. Reference to non-existent field keys

// Tool provides detailed logging:
console.log('📏 Payload size:', (size), 'KB');
console.log('🔍 Validation issues:', validationIssues);
```

### Validation Checks

The tool performs pre-submission validation:
- Checks for undefined values
- Verifies ConditionGroup structure
- Validates required properties (DisplayRowIndex, DisplayColumnIndex, TabIndex)
- Ensures FormFieldSetting is present for all fields

## Console Logging

Detailed console output for debugging:

```javascript
// Process tracking
🚀 Starting table duplication process...
📝 Step 1: Creating new table...
✅ New table created: [tableKey]
📝 Step 2: Duplicating X custom fields...
✅ Successfully created: X fields
📝 Step 4: Duplicating X form(s)...
   📋 Form transformation: X FormRule(s) included
   ✅ Created form: [formName]
🎉 Duplication complete!

// Field-level logging
🔍 Fetching dropdown values for ENUM field...
✅ Found X option(s) for Multiple Choice field
⏭️ Skipping relationship field: [fieldName]
⏭️ Skipping formula field: [fieldName]
🔑 Mapped: [oldKey] → [newKey]

// Form-level logging
🎨 Including design element: [elementName] (HTML)
⚠️ Skipping field in form (not created): [fieldName]
ℹ️ Total unmapped fields removed from form: X
```

## Known Limitations

1. **External Dependencies**: Cannot duplicate features that reference external tables
2. **Formula Fields**: Not duplicated due to potential field reference issues
3. **Relationship Fields**: Not duplicated as they require existing related tables
4. **Lookup Fields**: Not duplicated as they depend on external table relationships
5. **Complex FormStyleOptions**: Some advanced styling may need manual adjustment

## Best Practices

### Before Duplication

1. ✅ Review source table fields in the preview
2. ✅ Verify destination application is correct
3. ✅ Check form structure in "View Structure" modal
4. ✅ Consider if you need all forms or just specific ones

### After Duplication

1. ✅ Verify field count matches expectations
2. ✅ Check console for any failed fields/forms
3. ✅ Test form functionality in destination app
4. ✅ Add EmbeddedReports if needed
5. ✅ Configure permissions (ApplicationRoleForms)
6. ✅ Add DataFilters if required

### Troubleshooting

**Fields failing to create:**
- Check console for specific error messages
- Verify field type is supported
- Ensure no circular dependencies

**Forms failing to create:**
- Check for unmapped field references
- Verify all required fields were created successfully
- Review payload size (very large forms may timeout)
- Check ConditionGroup structure in console output

**Missing form elements:**
- Design elements (HTML) should be preserved
- Check if source fields were relationship/formula fields
- Verify field key mapping in console logs

## Dependencies

- **jQuery 3.7.1**: DOM manipulation and AJAX
- **Bootstrap 5.3.2**: UI framework
- **DataTables 1.13.7**: Interactive field table
- **CryptoJS 4.2.0**: Token decryption
- **Bootstrap Icons 1.11.1**: UI icons

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Version History

### v1.0.0 (Current)
- Initial release
- Table structure duplication
- Field mapping and transformation
- Form duplication with FormRules
- Intelligent exclusion of external dependencies
- Interactive field editor
- Technical mode with API testers

## Contributing

This tool is maintained for internal use within the GAB Platform. For issues or feature requests, please contact the development team.

## Security Notes

- User tokens are encrypted in localStorage using AES encryption
- Personal Access Tokens should be kept in `.github-credentials` (gitignored)
- Never commit credentials to the repository
- API calls use Bearer token authentication

## License

Internal use only - GAB Platform

---

**Developed for:** Internal Use  
**Platform:** GAB Platform  
**Last Updated:** November 2025

