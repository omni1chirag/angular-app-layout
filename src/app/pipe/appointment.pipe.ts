import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus, AppointmentStatusMeta, AppointmentType, AppointmentTypeMeta } from '@interface/appointment.interface';
// Note: Assuming 'AppointmentType' is available in the interface file.

// --- 1. Appointment Type Label Pipe (Original Logic Retained) ---
/**
 * Maps single/multiple AppointmentType key(s) to their human-readable label(s).
 * Renamed to be consistent with the other pipe names.
 */
@Pipe({
    name: 'appointmentTypeLabel',
    standalone: true // Set to true for modern Angular consistency
})
export class AppointmentTypeLabelPipe implements PipeTransform {

    transform(value: string | string[] | null | undefined): string {
        if (!value) return '';

        let types: string[] = [];

        // Case 1: Array of appointment types
        if (Array.isArray(value)) {
            types = value.map(t => t.trim());
        }
        // Case 2: Comma-separated string
        else if (typeof value === 'string' && value.includes(',')) {
            types = value.split(',').map(t => t.trim());
        }
        // Case 3: Single value
        else if (typeof value === 'string') {
            types = [value.trim()];
        }

        // Map valid types to their labels
        const labels = types
             // The type check below should use AppointmentTypeMeta keys
            .filter((t): t is keyof typeof AppointmentTypeMeta => t in AppointmentTypeMeta)
            .map(t => AppointmentTypeMeta[t].label);

        return labels.join(', ');
    }
}

// --- 2. Appointment Status Label Pipe ---
/**
 * Maps AppointmentStatus key to its human-readable label.
 * Renamed to 'AppointmentStatusLabelPipe' for consistency.
 */
@Pipe({ 
    name: 'appointmentStatusLabel', 
    standalone: true 
})
export class AppointmentStatusLabelPipe implements PipeTransform {
    transform(status: AppointmentStatus): string {
        return status && AppointmentStatusMeta[status] ? AppointmentStatusMeta[status].label : 'Status N/A';
    }
}

// --- 3. Appointment Status Background Color Pipe ---
/**
 * Maps AppointmentStatus key to its background color code.
 * Named: 'AppointmentStatusBgColorPipe'.
 */
@Pipe({ 
    name: 'appointmentStatusBgColor', 
    standalone: true 
})
export class AppointmentStatusBgColorPipe implements PipeTransform {
    transform(status: AppointmentStatus): string {
        // Fallback color is essential for styling consistency
        return status && AppointmentStatusMeta[status] ? AppointmentStatusMeta[status].bgColor : '#64748b'; 
    }
}

// --- 4. Appointment Type Icon Pipe ---
/**
 * Maps AppointmentType key to its PrimeNG icon class.
 * Named: 'AppointmentTypeIconPipe'.
 */
@Pipe({ 
    name: 'appointmentTypeIcon', 
    standalone: true 
})
export class AppointmentTypeIconPipe implements PipeTransform {
    // Note: Assuming the timeline logic only passes a single AppointmentType key here
    transform(type: AppointmentType): string { 
        // Fallback icon for safety
        return type && AppointmentTypeMeta[type] ? AppointmentTypeMeta[type].icon : 'pi pi-question-circle'; 
    }
}