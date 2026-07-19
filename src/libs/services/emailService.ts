interface EmailNotificationData {
  teamName: string;
  teamLeaderName: string;
  teamLeaderEmail: string;
  competitionName: string;
  status: 'approved' | 'rejected';
  adminNotes?: string;
  whatsappGroupLink?: string;
}

export const sendRegistrationStatusEmail = async (data: EmailNotificationData) => {
  try {
    const response = await fetch('/api/send-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
