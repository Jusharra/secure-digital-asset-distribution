import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get an unclaimed ID
    const { data: idData, error: idError } = await supabaseClient
      .from('id_bank')
      .select('code')
      .eq('claimed', false)
      .limit(1)
      .single()

    if (idError) throw idError

    // Mark the ID as claimed and update the asset
    const { error: updateError } = await supabaseClient
      .from('digital_assets')
      .update({ 
        display_id: idData.code 
      })
      .eq('id', '19ce27c6-9f24-4285-ab96-ba371e5a4225')

    if (updateError) throw updateError

    // Update id_bank to mark as claimed
    const { error: bankError } = await supabaseClient
      .from('id_bank')
      .update({ claimed: true })
      .eq('code', idData.code)

    if (bankError) throw bankError

    return new Response(
      JSON.stringify({ success: true, code: idData.code }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})