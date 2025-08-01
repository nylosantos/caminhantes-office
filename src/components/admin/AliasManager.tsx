import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Loader, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAliases } from '@/contexts/AliasContext';

interface AliasModalProps {
  alias: { id?: string; name: string; alias: string } | null;
  onClose: () => void;
  onSave: (data: { id?: string; name: string; alias: string }) => void;
}

const AliasModal: React.FC<AliasModalProps> = ({ alias, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: alias?.name || '',
    alias: alias?.alias || '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.alias.trim()) {
      setError('Preencha ambos os campos.');
      return;
    }
    onSave({ ...alias, ...form });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">
          {alias ? 'Editar Alias' : 'Novo Alias'}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Nome original"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Alias</label>
            <input
              type="text"
              value={form.alias}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, alias: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Nome alternativo"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 text-white"
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AliasManager: React.FC = () => {
  const { aliases, loading, addAlias, updateAlias, deleteAlias } = useAliases();
  const [search, setSearch] = useState('');
  const [modalAlias, setModalAlias] = useState<AliasModalProps['alias']>(null);

  const filtered = aliases.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (aliasId: string, name: string) => {
    const confirmed = await showConfirmDialog({
      title: 'Deletar Alias',
      text: `Deseja mesmo deletar o alias de "${name}"?`,
      confirmButtonText: 'Deletar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmed) {
      await deleteAlias(aliasId, name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display-bold text-gray-800">Aliases</h2>
          <p className="text-gray-600 font-display">
            Mapeie nomes alternativos para entidades
          </p>
        </div>
        <Button
          onClick={() => setModalAlias({ name: '', alias: '' })}
          className="bg-green-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Alias
        </Button>
      </div>

      <div className="bg-white p-4 border rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2" />
              Nenhum alias encontrado.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">Alias</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered
                  .sort((a, b) => a.alias.localeCompare(b.alias))
                  .map((alias) => (
                    <tr
                      key={alias.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-3">{alias.name}</td>
                      <td className="px-6 py-3">{alias.alias}</td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModalAlias(alias)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(alias.id!, alias.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modalAlias && (
        <AliasModal
          alias={modalAlias}
          onClose={() => setModalAlias(null)}
          onSave={async (data) => {
            if (data.id) {
              await updateAlias(data);
            } else {
              await addAlias(data);
            }
          }}
        />
      )}
    </div>
  );
};

export default AliasManager;
