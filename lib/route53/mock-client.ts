import {
  CreateRecordParams,
  UpdateRecordParams,
  DeleteRecordParams,
  Route53Response,
} from './types';

/**
 * Mock AWS Route 53 Client
 * Simulates Route 53 API responses for development
 * In production, replace with actual AWS SDK implementation
 */
class MockRoute53Client {
  private mockDelay = 300; // Simulate network delay

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.mockDelay));
  }

  async createRecord(params: CreateRecordParams): Promise<Route53Response> {
    await this.simulateDelay();

    console.log('[Mock Route53] Creating record:', params);

    // Simulate successful creation
    return {
      success: true,
      message: 'DNS record created successfully',
      data: {
        changeId: `mock-change-${Date.now()}`,
        status: 'PENDING',
      },
    };
  }

  async updateRecord(params: UpdateRecordParams): Promise<Route53Response> {
    await this.simulateDelay();

    console.log('[Mock Route53] Updating record:', params);

    return {
      success: true,
      message: 'DNS record updated successfully',
      data: {
        changeId: `mock-change-${Date.now()}`,
        status: 'PENDING',
      },
    };
  }

  async deleteRecord(params: DeleteRecordParams): Promise<Route53Response> {
    await this.simulateDelay();

    console.log('[Mock Route53] Deleting record:', params);

    return {
      success: true,
      message: 'DNS record deleted successfully',
      data: {
        changeId: `mock-change-${Date.now()}`,
        status: 'PENDING',
      },
    };
  }

  async getChangeStatus(changeId: string): Promise<Route53Response> {
    await this.simulateDelay();

    // Simulate immediate propagation for mock
    return {
      success: true,
      data: {
        changeId,
        status: 'INSYNC',
      },
    };
  }
}

export const route53Client = new MockRoute53Client();
