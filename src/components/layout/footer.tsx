import { Logo } from '@/components/brand/logo'

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#E6F5F5] px-8 pt-12 pb-8 mt-16">
      <div className="max-w-6xl mx-auto flex justify-between items-start flex-wrap gap-8">
        <div className="max-w-xs">
          <Logo height={32} dark />
          <p className="text-sm opacity-70 mt-3 leading-relaxed">
            A infraestrutura digital de São Miguel do Gostoso.<br />A plataforma é da cidade.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div>
            <div className="font-semibold mb-2 text-white">Módulos</div>
            <div className="opacity-70 leading-loose">COME<br/>FIQUE<br/>PASSEIE<br/>EXPLORE</div>
          </div>
          <div>
            <div className="font-semibold mb-2 text-white">Cidade</div>
            <div className="opacity-70 leading-loose">CONHEÇA<br/>PARTICIPE<br/>APOIE</div>
          </div>
          <div>
            <div className="font-semibold mb-2 text-white">Negócios</div>
            <div className="opacity-70 leading-loose">Cadastrar<br/>Painel<br/>Selo verificado</div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#3D3D3D] mt-10 pt-5 text-xs opacity-50 max-w-6xl mx-auto flex justify-between">
        <span>vivegostoso.com.br · São Miguel do Gostoso, RN</span>
        <span>A plataforma é da cidade.</span>
      </div>
    </footer>
  )
}
