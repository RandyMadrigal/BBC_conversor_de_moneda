import { useState } from 'react';
import { 
  Button,
  Spinner,
  Card,
  CardBody,
  // Tooltip,
  useDisclosure
} from '@nextui-org/react';
import { Users as UsersIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/services/api/users';
import UsersTable from '@/components/admin/UsersTable';
import UserModal from '@/components/admin/UserModal';
import type { User } from '@/types/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getAll();
      return response.data;
    },
  });

  if (error) {
    const errorResponse = error as { response?: { status?: number } };
    if (errorResponse.response?.status === 401) {
      logout();
      navigate('/users/login');
    }
    toast.error(error.message || 'Failed to load Users');
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Card>
          <CardBody className="py-8 px-12 flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-danger/10">
              <UsersIcon className="text-danger" size={24} />
            </div>
            <p className="text-danger text-lg font-medium">
              {(error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to load users'}
            </p>
            <Button 
              color="primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardBody className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/20">
              <UsersIcon className="text-primary-500" size={24} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Users Management
            </h1>
          </div>
        </CardBody>
      </Card>

      {users.length === 0 ? (
        <Card className="mt-8">
          <CardBody className="py-12 flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary-50 dark:bg-primary-900/20">
              <UsersIcon className="text-primary-500" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              No Users Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              There are currently no users in the system.
            </p>
          </CardBody>
        </Card>
      ) : (
        <UsersTable 
          users={users}
          onEdit={handleEdit}
        />
      )}

      <UserModal
        user={selectedUser}
        isOpen={isOpen}
        onClose={onClose}
      />
    </div>
  );
}