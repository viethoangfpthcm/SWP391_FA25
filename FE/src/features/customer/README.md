# Customer Module

## Structure

```
customer/
├── CustomerDashboard.jsx          # Main customer dashboard page
├── CustomerDashboard.css
└── shared/                        # Reusable customer components
    ├── AddVehicleModal.jsx        # Modal for adding new vehicle
    ├── BookingStats.jsx           # Booking statistics component
    ├── ConfirmModal.jsx           # Generic confirmation modal
    ├── CustomerProfile.jsx        # Customer profile component
    ├── EditProfileModal.jsx       # Modal for editing profile
    ├── FeedbackModal.jsx          # Modal for submitting feedback
    ├── SuccessModal.jsx           # Success message modal
    ├── VehicleList.jsx            # Vehicle list display component
    ├── VehicleMaintenanceSchedule.jsx  # Vehicle maintenance schedule page
    └── VehicleMaintenanceSchedule.css
```

## Components

### Main Pages
- **CustomerDashboard**: Main dashboard showing bookings, vehicles, and statistics

### Shared Components
- **AddVehicleModal**: Modal for adding new vehicle to customer's list
- **BookingStats**: Display booking statistics and summaries
- **ConfirmModal**: Reusable confirmation dialog
- **CustomerProfile**: Display and manage customer profile information
- **EditProfileModal**: Modal for editing customer profile details
- **FeedbackModal**: Modal for customers to submit service feedback
- **SuccessModal**: Display success messages after actions
- **VehicleList**: Display list of customer's vehicles
- **VehicleMaintenanceSchedule**: View and manage vehicle maintenance schedule

## Usage

Import components from the customer module:

```jsx
import CustomerDashboard from '@features/customer/CustomerDashboard';
import AddVehicleModal from '@features/customer/shared/AddVehicleModal';
import VehicleList from '@features/customer/shared/VehicleList';
```

## Notes

- All shared components use absolute imports (@components, @config, @features)
- No need to update imports when moving files to shared folder
- Follow the same pattern as admin and manager modules
