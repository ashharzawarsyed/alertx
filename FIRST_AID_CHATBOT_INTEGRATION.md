# First Aid Chatbot Integration

## Overview
The First Aid Chatbot provides real-time first aid guidance to patients while waiting for the ambulance. It uses n8n workflow with RAG (Retrieval Augmented Generation) to fetch relevant first aid information from a Pinecone vector store.

## Architecture

```
User App Emergency Flow:
1. Patient enters symptoms
2. NLP analyzes symptoms → Dispatches ambulance
3. "First Aid Guide" button appears
4. Opens chatbot modal with:
   - Initial first aid guidance (auto-loaded based on symptoms)
   - Interactive chat for additional questions
5. n8n workflow processes queries via RAG + Pinecone
```

## Backend API

### Endpoint
```
POST /api/v1/first-aid/guidance
Authorization: Bearer {token}
```

### Request Body
```json
{
  "symptoms": ["chest pain", "breathing difficulty"],
  "message": "How do I help someone with chest pain?",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "First aid guidance retrieved",
  "data": {
    "guidance": {
      "message": "⚠️ **URGENT: Chest Pain First Aid**\n\n1. Call emergency services...",
      "steps": ["Sit down and rest", "Loosen tight clothing", ...]
    },
    "conversationId": "uuid",
    "isFallback": false
  }
}
```

## User App Integration

### 1. Import the Component
```typescript
import FirstAidChatbot from '../components/FirstAidChatbot';
```

### 2. Add State Management
```typescript
const [showFirstAidChat, setShowFirstAidChat] = useState(false);
const [emergencySymptoms, setEmergencySymptoms] = useState([]);
const [currentEmergencyId, setCurrentEmergencyId] = useState(null);
```

### 3. After Successful Dispatch
After ambulance is dispatched and you show driver details:

```typescript
// In your emergency dispatch success handler
<View style={styles.emergencyDetails}>
  {/* Existing: Driver name, phone, ETA, etc. */}
  
  {/* NEW: First Aid Guide Button */}
  <TouchableOpacity
    style={styles.firstAidButton}
    onPress={() => setShowFirstAidChat(true)}
  >
    <Ionicons name="medical" size={24} color="#fff" />
    <Text style={styles.firstAidButtonText}>
      First Aid Guide
    </Text>
  </TouchableOpacity>
</View>

{/* Chatbot Modal */}
<FirstAidChatbot
  visible={showFirstAidChat}
  onClose={() => setShowFirstAidChat(false)}
  symptoms={emergencySymptoms}
  emergencyId={currentEmergencyId}
/>
```

### 4. Button Styles
```typescript
const styles = StyleSheet.create({
  firstAidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  firstAidButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
```

## n8n Workflow Configuration

### 1. Create Webhook Trigger
- URL: `http://your-n8n-instance:5678/webhook/first-aid`
- Method: POST
- Authentication: None (or add API key)

### 2. Workflow Structure
```
Webhook Trigger
  ↓
Extract Symptoms/Message
  ↓
Pinecone Vector Search
  ↓
Retrieve Top 5 Relevant Documents
  ↓
OpenAI/LLM Agent
  ├─ System Prompt: "You are a first aid expert..."
  ├─ User Query
  └─ Retrieved Context
  ↓
Format Response
  ↓
Return JSON
```

### 3. Expected Response Format
```json
{
  "response": "For chest pain, immediately...",
  "conversationId": "uuid-v4",
  "sources": ["first-aid-guide-cardiac.pdf", "emergency-procedures.pdf"]
}
```

## Environment Variables

### Backend (.env)
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/first-aid
# Or production URL:
# N8N_WEBHOOK_URL=https://your-n8n.com/webhook/first-aid
```

## Fallback Mechanism

If n8n is unavailable, the backend automatically provides fallback guidance for common emergencies:
- Chest Pain / Cardiac
- Severe Bleeding
- Breathing Difficulty
- Seizures
- General Emergency

## Features

✅ Auto-loads initial first aid guidance based on symptoms
✅ Interactive chat for follow-up questions
✅ Conversation history maintained for context
✅ Fallback responses if n8n is down
✅ Real-time typing indicators
✅ Formatted markdown responses
✅ Mobile-optimized UI
✅ Keyboard-aware scrolling

## Testing

### Test Without n8n
The fallback mechanism will automatically activate, providing basic first aid guidance.

### Test With n8n
1. Start n8n: `npm run start` (in n8n directory)
2. Activate your workflow
3. Test webhook: `curl -X POST http://localhost:5678/webhook/first-aid -H "Content-Type: application/json" -d '{"message":"chest pain help","symptoms":["chest pain"]}'`
4. Trigger emergency in app
5. Click "First Aid Guide" button

## Next Steps

1. **Deploy n8n** to production (Railway, Heroku, DigitalOcean)
2. **Add Authentication** to n8n webhook (API key in headers)
3. **Enhance RAG** with more comprehensive first aid documents
4. **Add Voice Input** for hands-free operation
5. **Multilingual Support** for different languages
6. **Offline Mode** with cached responses

## Integration Example

See complete implementation in:
- Backend: `apps/backend/controllers/firstAidController.js`
- Routes: `apps/backend/routes/firstAidRoutes.js`
- Component: `apps/emergency-user-app/src/components/FirstAidChatbot.tsx`

## Support

For issues or questions:
1. Check backend logs for n8n connection errors
2. Verify n8n webhook URL is correct
3. Test fallback mechanism
4. Check network connectivity from mobile device
