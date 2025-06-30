import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Input,
  Button
} from "@k2600x/design-system";

interface StrapiRelationFieldProps {
  value: string | number | Array<string | number> | null;
  onChange: (value: string | number | Array<string | number> | undefined) => void;
  target: string; // Strapi collection name
  isMulti?: boolean;
  placeholder?: string;
  displayField?: string; // Field used as label (default: "name")
}

interface RelationRecord {
  id: number;
  documentId: string;
  [key: string]: any;
}

export const StrapiRelationField: React.FC<StrapiRelationFieldProps> = ({
  value,
  onChange,
  target,
  isMulti = false,
  placeholder = "Select relation...",
  displayField = "name",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch related records
  const { data: relationData, isLoading, error } = useQuery<{data: RelationRecord[]}>({
    queryKey: ["relation", target, searchTerm],
    queryFn: async () => {
      const encodedTarget = btoa(target);
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/strapi/collections/${encodedTarget}?pageSize=50${searchParam}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch relation data: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!target
  });

  // Get display value for current selection
  const currentDisplayValue = useMemo(() => {
    console.log('🔍 Computing display value:', { 
      value, 
      hasRelationData: !!relationData?.data,
      dataLength: relationData?.data?.length,
      displayField,
      firstRecord: relationData?.data?.[0]
    });
    
    if (!value) return '';
    
    // Handle when relation data is still loading or not available
    if (!relationData?.data?.length) {
      // If we have a value but no relation data yet, show a placeholder
      if (typeof value === 'object' && value !== null) {
        // Value is an object (full relation object), extract display field
        return value[displayField] || value.name || value.documentId || value.id || 'Loading...';
      }
      return 'Loading...';
    }
    
    if (isMulti && Array.isArray(value)) {
      const selectedRecords = relationData.data.filter(record => 
        value.includes(record.documentId) || value.includes(record.id)
      );
      return selectedRecords.map(record => 
        record[displayField] || record.name || record.documentId || record.id
      ).join(', ');
    } else {
      // Handle single selection
      let selectedRecord;
      
      if (typeof value === 'object' && value !== null) {
        // Value is a full object, find it by documentId or id
        selectedRecord = relationData.data.find(record => 
          record.documentId === value.documentId || 
          record.id === value.id ||
          record.documentId === value ||
          record.id === value
        );
        
        // If not found in data, use the object itself
        if (!selectedRecord) {
          return value[displayField] || value.name || value.documentId || value.id || 'Unknown';
        }
      } else {
        // Value is just an id/documentId string
        selectedRecord = relationData.data.find(record => 
          record.documentId === value || record.id === value
        );
      }
      
      const displayValue = selectedRecord ? 
        (selectedRecord[displayField] || selectedRecord.name || selectedRecord.documentId || selectedRecord.id) : 
        'Not found';
        
      console.log('✅ Display value computed:', { 
        selectedRecord, 
        displayValue,
        usedField: selectedRecord?.[displayField] ? displayField : 'fallback'
      });
      
      return displayValue;
    }
  }, [value, relationData, displayField, isMulti]);

  // Handle single selection
  const handleSingleSelect = (selectedValue: string) => {
    console.log('🔗 Relation field value changed:', { 
      target, 
      selectedValue, 
      currentValue: value 
    });
    
    if (selectedValue === 'clear') {
      onChange(undefined);
      return;
    }
    
    const selectedRecord = relationData?.data?.find(record => 
      record.documentId === selectedValue || record.id.toString() === selectedValue
    );
    
    if (selectedRecord) {
      console.log('✅ Setting relation value:', selectedRecord.documentId || selectedRecord.id);
      onChange(selectedRecord.documentId || selectedRecord.id);
    }
  };

  // Handle multi selection (simplified - adds/removes items)
  const handleMultiToggle = (selectedValue: string | number) => {
    if (!isMulti) return;
    
    const currentValues = Array.isArray(value) ? value : [];
    const isSelected = currentValues.includes(selectedValue);
    
    if (isSelected) {
      // Remove from selection
      const newValues = currentValues.filter(v => v !== selectedValue);
      onChange(newValues.length > 0 ? newValues : undefined);
    } else {
      // Add to selection
      onChange([...currentValues, selectedValue]);
    }
  };

  if (error) {
    return (
      <Input
        id="relation-error"
        value={`Error loading ${target} relations`}
        onChange={() => {}}
        disabled
        readOnly
      />
    );
  }

  // For multi-select relations, show a simplified interface
  if (isMulti) {
    return (
      <div className="space-y-2">
        <Input
          id="relation-search"
          placeholder="Search relations..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
        />
        
        <div className="text-sm text-gray-600">
          Selected: {currentDisplayValue || 'None'}
        </div>
        
        <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : relationData?.data?.length ? (
            relationData.data
              .filter(record => {
                if (!searchTerm) return true;
                const searchValue = record[displayField] || record.documentId || record.id;
                return searchValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
              })
              .map(record => {
                const isSelected = Array.isArray(value) && 
                  (value.includes(record.documentId) || value.includes(record.id));
                
                return (
                  <div 
                    key={record.documentId || record.id}
                    className={`text-xs p-1 cursor-pointer rounded ${
                      isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleMultiToggle(record.documentId || record.id.toString())}
                  >
                    {record[displayField] || record.documentId || record.id}
                  </div>
                );
              })
          ) : (
            <div className="text-sm text-gray-500">No records found</div>
          )}
        </div>
      </div>
    );
  }

  // Get the correct value for the Select component
  const selectValue = useMemo(() => {
    if (!value) return '';
    
    if (typeof value === 'object' && value !== null) {
      // Value is an object, use its documentId or id
      return value.documentId || value.id?.toString() || '';
    }
    
    // Value is a primitive (string/number)
    return value.toString();
  }, [value]);

  // Single select interface
  return (
    <Select value={selectValue} onValueChange={handleSingleSelect}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="clear">
          <span className="text-gray-500">Clear selection</span>
        </SelectItem>
        
        {relationData?.data?.map(record => (
          <SelectItem 
            key={record.documentId || record.id} 
            value={record.documentId || record.id.toString()}
          >
            {record[displayField] || record.documentId || record.id}
          </SelectItem>
        ))}
        
        {isLoading && (
          <SelectItem value="" disabled>
            Loading...
          </SelectItem>
        )}
        
        {!isLoading && !relationData?.data?.length && (
          <SelectItem value="" disabled>
            No records found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default StrapiRelationField;