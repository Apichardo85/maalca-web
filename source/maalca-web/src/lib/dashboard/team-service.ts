// Team Management Service
import { apiClient } from '@/lib/api/apiClient';

export type TeamMemberStatus = 'active' | 'inactive' | 'on_leave';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: TeamMemberStatus;
  joinDate: string;
  avatar?: string;
}

export interface TeamListResponse {
  data: TeamMember[];
  total: number;
}

export interface CreateTeamMemberDto {
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
}

class TeamService {
  /**
   * List team members
   * WEB-016: Listar equipo desde API
   */
  async list(
    affiliateId: string,
    options: { department?: string; status?: string } = {}
  ): Promise<TeamListResponse | null> {
    try {
      const params = new URLSearchParams();
      if (options.department) params.set('department', options.department);
      if (options.status) params.set('status', options.status);

      const response = await apiClient.get<TeamListResponse>(
        `/api/affiliates/${affiliateId}/team?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching team:', error);
      return null;
    }
  }

  /**
   * Add team member
   * WEB-017: Agregar miembro del equipo
   */
  async create(affiliateId: string, data: CreateTeamMemberDto): Promise<TeamMember | null> {
    try {
      const response = await apiClient.post<TeamMember>(
        `/api/affiliates/${affiliateId}/team`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating team member:', error);
      return null;
    }
  }

  /**
   * Update team member
   */
  async update(affiliateId: string, memberId: string, data: Partial<CreateTeamMemberDto>): Promise<TeamMember | null> {
    try {
      const response = await apiClient.put<TeamMember>(
        `/api/affiliates/${affiliateId}/team/${memberId}`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Error updating team member ${memberId}:`, error);
      return null;
    }
  }

  /**
   * Delete team member
   */
  async delete(affiliateId: string, memberId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/affiliates/${affiliateId}/team/${memberId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting team member ${memberId}:`, error);
      return false;
    }
  }
}

export const teamService = new TeamService();
