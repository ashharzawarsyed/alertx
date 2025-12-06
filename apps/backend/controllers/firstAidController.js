import axios from 'axios';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { sendResponse } from '../utils/helpers.js';
import { RESPONSE_CODES } from '../utils/constants.js';

/**
 * @desc    Get first aid guidance from n8n chatbot
 * @route   POST /api/v1/first-aid/guidance
 * @access  Private
 */
export const getFirstAidGuidance = asyncHandler(async (req, res) => {
  const { symptoms, message, conversationHistory } = req.body;

  if (!symptoms && !message) {
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      'Symptoms or message is required'
    );
  }

  // n8n webhook URL - should be in environment variables
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://6580ad4ecf78.ngrok-free.app/webhook-test/609f9961-b8a9-4af4-b5f2-a0208fcb5e31';

  try {

    // Prepare the payload for n8n
    const payload = {
      message: message || `I need first aid guidance for: ${symptoms.join(', ')}`,
      symptoms: symptoms || [],
      conversationHistory: conversationHistory || [],
      patientId: req.user.id,
      timestamp: new Date().toISOString(),
    };

    console.log('🤖 Sending to n8n chatbot:', payload);

    // Call n8n webhook
    const response = await axios.post(n8nWebhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('✅ n8n response received:', response.data);

    // Extract text from various possible response structures
    let guidanceText;
    if (typeof response.data === 'string') {
      guidanceText = response.data;
    } else if (response.data.output) {
      guidanceText = typeof response.data.output === 'string' 
        ? response.data.output 
        : JSON.stringify(response.data.output);
    } else if (response.data.response) {
      guidanceText = response.data.response;
    } else if (response.data.message) {
      guidanceText = response.data.message;
    } else if (response.data.text) {
      guidanceText = response.data.text;
    } else {
      guidanceText = JSON.stringify(response.data);
    }

    sendResponse(
      res,
      RESPONSE_CODES.SUCCESS,
      'First aid guidance retrieved',
      {
        guidance: guidanceText,
        conversationId: response.data.conversationId,
      }
    );
  } catch (error) {
    console.error('❌ n8n chatbot error:', error.message);
    console.error('❌ Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: n8nWebhookUrl,
    });
    
    // Fallback response if n8n is unavailable
    const fallbackGuidance = generateFallbackGuidance(symptoms);
    
    sendResponse(
      res,
      RESPONSE_CODES.SUCCESS,
      'First aid guidance retrieved (fallback)',
      {
        guidance: fallbackGuidance,
        isFallback: true,
      }
    );
  }
});

/**
 * Generate fallback first aid guidance when n8n is unavailable
 */
function generateFallbackGuidance(symptoms = []) {
  const symptomText = symptoms.join(', ').toLowerCase();
  
  // Basic first aid responses based on common symptoms
  if (symptomText.includes('chest pain') || symptomText.includes('heart')) {
    return {
      message: "⚠️ **URGENT: Chest Pain First Aid**\n\n" +
        "1. **Call emergency services immediately** (if not already done)\n" +
        "2. Have the person **sit down and rest**\n" +
        "3. **Loosen tight clothing**\n" +
        "4. If prescribed, help them take **nitroglycerin**\n" +
        "5. If they have aspirin and are not allergic, have them **chew one aspirin**\n" +
        "6. **Stay calm** and keep the person comfortable\n" +
        "7. **Monitor breathing and pulse**\n" +
        "8. Be prepared to perform CPR if needed\n\n" +
        "🚑 Ambulance is on the way!",
      steps: [
        'Sit down and rest',
        'Loosen tight clothing',
        'Take prescribed medication if available',
        'Monitor vital signs',
      ],
    };
  }
  
  if (symptomText.includes('bleeding') || symptomText.includes('blood')) {
    return {
      message: "🩸 **Severe Bleeding First Aid**\n\n" +
        "1. **Apply direct pressure** with a clean cloth\n" +
        "2. **Maintain pressure** for at least 10-15 minutes\n" +
        "3. **Elevate the wound** above heart level if possible\n" +
        "4. **Do NOT remove** the cloth if blood soaks through - add more layers\n" +
        "5. Once bleeding slows, **secure with bandage**\n" +
        "6. **Keep the person warm** to prevent shock\n" +
        "7. **Do not give** food or water\n\n" +
        "🚑 Ambulance is on the way!",
      steps: [
        'Apply direct pressure',
        'Elevate wound',
        'Maintain pressure',
        'Prevent shock',
      ],
    };
  }
  
  if (symptomText.includes('breathe') || symptomText.includes('breathing')) {
    return {
      message: "🫁 **Breathing Difficulty First Aid**\n\n" +
        "1. Help the person **sit upright** (do not lay down)\n" +
        "2. **Loosen tight clothing** around neck and chest\n" +
        "3. **Open windows** for fresh air\n" +
        "4. **Stay calm** and encourage slow, deep breaths\n" +
        "5. If they have an **inhaler**, help them use it\n" +
        "6. **Monitor closely** for worsening symptoms\n" +
        "7. Be prepared for **CPR** if breathing stops\n\n" +
        "🚑 Ambulance is on the way!",
      steps: [
        'Sit upright',
        'Loosen clothing',
        'Fresh air',
        'Use inhaler if available',
      ],
    };
  }
  
  if (symptomText.includes('seizure') || symptomText.includes('convuls')) {
    return {
      message: "😰 **Seizure First Aid**\n\n" +
        "1. **Stay calm** and time the seizure\n" +
        "2. **Clear the area** of dangerous objects\n" +
        "3. **Cushion the head** with something soft\n" +
        "4. **Turn person on side** to keep airway clear\n" +
        "5. **DO NOT** put anything in their mouth\n" +
        "6. **DO NOT** restrain them\n" +
        "7. Stay with them until **fully conscious**\n" +
        "8. Time the seizure - call 911 if **longer than 5 minutes**\n\n" +
        "🚑 Ambulance is on the way!",
      steps: [
        'Clear area',
        'Cushion head',
        'Turn on side',
        'Stay with them',
      ],
    };
  }
  
  // General guidance
  return {
    message: "🏥 **General Emergency First Aid**\n\n" +
      "1. **Stay calm** - help is on the way\n" +
      "2. **Keep the person comfortable** and still\n" +
      "3. **Monitor breathing and pulse**\n" +
      "4. **Reassure the person** - ambulance is coming\n" +
      "5. **Do not move** the person unless in immediate danger\n" +
      "6. **Note symptoms** and changes in condition\n" +
      "7. **Gather medical information** (medications, allergies)\n\n" +
      "🚑 Ambulance is on the way!\n\n" +
      "💬 You can ask me specific questions about first aid procedures.",
    steps: [
      'Stay calm',
      'Monitor vital signs',
      'Keep comfortable',
      'Wait for ambulance',
    ],
  };
}

export default { getFirstAidGuidance };
