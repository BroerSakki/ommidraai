interface UserGroupDetails {
  user_id: number;
  group_id: number;
  role: string;
  car_capacity: number;
  is_passenger: boolean;
}

interface GroupDetails {
  name: string;
  actionLabel: string;
  actionVariant?: "danger" | "warning";
}

export interface GroupItem {
  User_Group: UserGroupDetails;
  Group: GroupDetails;
  onOpen: () => void;
  onAction: () => void;
}


export default function GroupCard({ groupItem,onOpen,onAction,actionLabel,actionVariant = "danger",}: { groupItem: GroupItem }) {
  const { Group, User_Group } = groupItem;

  return (
    <div className="p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:shadow-md transition duration-200 flex flex-col justify-between">
      <div>
        <div className="w-10 h-10 rounded-lg bg-[#a8be8f] text-[#3d3461] flex items-center justify-center font-bold text-lg mb-3">
          {Group.name.charAt(0).toUpperCase()}
        </div>
        <h3 className="font-semibold text-[#3d3461] text-lg line-clamp-1">{Group.name}</h3>
        <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#a8be8f] text-[#3d3461] capitalize">
          {User_Group.role}
        </span>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Open
        </button>
        
      </div>
    </div>
  );
}
