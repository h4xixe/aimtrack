
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Settings, 
  Plus, 
  Upload, 
  Download, 
  Trash, 
  Copy, 
  Edit, 
  Check, 
  X,
  FileCode,
  FolderPlus
} from "lucide-react";

interface ConfigsProps {
  user: {
    username: string;
  };
  isDemoMode: boolean;
  language: string;
}

interface Config {
  id: string;
  name: string;
  description: string;
  content: string;
  author: string;
  downloads: number;
  createdAt: string;
  isPublic: boolean;
}

const ConfigsSection: React.FC<ConfigsProps> = ({ user, isDemoMode, language }) => {
  const [activeTab, setActiveTab] = useState("my-configs");
  const [configName, setConfigName] = useState("");
  const [configDescription, setConfigDescription] = useState("");
  const [configContent, setConfigContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [newConfigName, setNewConfigName] = useState("");
  
  // Demo data
  const myConfigs: Config[] = [
    {
      id: "1",
      name: "Default Config",
      description: "My primary configuration",
      content: '{\n  "theme": "dark",\n  "fontSize": 14,\n  "autoSave": true\n}',
      author: user.username,
      downloads: 124,
      createdAt: "2025-03-15",
      isPublic: true
    },
    {
      id: "2",
      name: "Backup Config",
      description: "Secondary configuration for testing",
      content: '{\n  "theme": "light",\n  "fontSize": 12,\n  "autoSave": false\n}',
      author: user.username,
      downloads: 56,
      createdAt: "2025-04-20",
      isPublic: false
    }
  ];
  
  const publicConfigs: Config[] = [
    {
      id: "3",
      name: "Pro Settings",
      description: "Optimized for performance",
      content: '{\n  "performance": "high",\n  "customFeatures": true,\n  "advancedOptions": {\n    "enabled": true\n  }\n}',
      author: "WYZ_Pro",
      downloads: 1245,
      createdAt: "2025-02-10",
      isPublic: true
    },
    {
      id: "4",
      name: "Beginners Setup",
      description: "Easy to use configuration for new users",
      content: '{\n  "tutorialMode": true,\n  "simpleInterface": true,\n  "helpTips": true\n}',
      author: "WYZ_Helper",
      downloads: 892,
      createdAt: "2025-01-05",
      isPublic: true
    }
  ];

  const translations = {
    'en': {
      myConfigs: 'My Configs',
      publicConfigs: 'Public Configs',
      createConfig: 'Create Config',
      configName: 'Config Name',
      configDescription: 'Description',
      configContent: 'Config Content',
      makePublic: 'Make Public',
      uploadFile: 'Upload File',
      chooseFile: 'Choose File',
      create: 'Create',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      duplicate: 'Duplicate',
      download: 'Download',
      author: 'Author',
      downloads: 'Downloads',
      created: 'Created',
      noFile: 'No file selected',
      publicVisibility: 'Public',
      privateVisibility: 'Private',
      searchPlaceholder: 'Search configs...',
      editConfig: 'Edit Config',
      save: 'Save Changes',
    },
    'pt-BR': {
      myConfigs: 'Minhas Configs',
      publicConfigs: 'Configs Públicas',
      createConfig: 'Criar Config',
      configName: 'Nome da Config',
      configDescription: 'Descrição',
      configContent: 'Conteúdo da Config',
      makePublic: 'Tornar Pública',
      uploadFile: 'Enviar Arquivo',
      chooseFile: 'Escolher Arquivo',
      create: 'Criar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Excluir',
      duplicate: 'Duplicar',
      download: 'Baixar',
      author: 'Autor',
      downloads: 'Downloads',
      created: 'Criado em',
      noFile: 'Nenhum arquivo selecionado',
      publicVisibility: 'Pública',
      privateVisibility: 'Privada',
      searchPlaceholder: 'Buscar configs...',
      editConfig: 'Editar Config',
      save: 'Salvar Alterações',
    }
  };

  const t = translations[language as keyof typeof translations] || translations['en'];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setConfigContent(event.target.result as string);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };
  
  const handleCreateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!configName.trim()) {
      toast.error(language === 'pt-BR' ? 'Por favor, forneça um nome para a config' : 'Please provide a config name');
      return;
    }
    
    if (!configContent.trim()) {
      toast.error(language === 'pt-BR' ? 'O conteúdo da config não pode estar vazio' : 'Config content cannot be empty');
      return;
    }
    
    // In demo mode, just show a success message
    toast.success(language === 'pt-BR' ? 'Config criada com sucesso!' : 'Config created successfully!');
    
    // Reset the form
    setConfigName("");
    setConfigDescription("");
    setConfigContent("");
    setSelectedFile(null);
    setIsPublic(false);
    
    // Switch to my configs tab
    setActiveTab("my-configs");
  };
  
  const handleDownloadConfig = (config: Config) => {
    // Create a blob and download it
    const blob = new Blob([config.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(language === 'pt-BR' ? 'Config baixada!' : 'Config downloaded!');
  };
  
  const handleDeleteConfig = (id: string) => {
    // In demo mode, just show a success message
    toast.success(language === 'pt-BR' ? 'Config excluída!' : 'Config deleted!');
  };
  
  const handleDuplicateConfig = (config: Config) => {
    // In demo mode, just show a success message
    toast.success(language === 'pt-BR' ? 'Config duplicada!' : 'Config duplicated!');
  };
  
  const handleEditConfig = (config: Config) => {
    setEditingConfigId(config.id);
    setNewConfigName(config.name);
  };
  
  const saveEditedConfig = (id: string) => {
    if (!newConfigName.trim()) {
      toast.error(language === 'pt-BR' ? 'O nome não pode estar vazio' : 'Name cannot be empty');
      return;
    }
    
    // In demo mode, just show a success message
    toast.success(language === 'pt-BR' ? 'Config atualizada!' : 'Config updated!');
    setEditingConfigId(null);
  };
  
  const cancelEdit = () => {
    setEditingConfigId(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text">
          {language === 'pt-BR' ? 'Gerenciador de Configurações' : 'Configuration Manager'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'pt-BR' ? 'Crie e gerencie suas configurações personalizadas' : 'Create and manage your custom configurations'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6 w-full">
          <TabsTrigger value="my-configs" className="flex items-center gap-2">
            <Settings size={16} />
            <span>{t.myConfigs}</span>
          </TabsTrigger>
          <TabsTrigger value="public-configs" className="flex items-center gap-2">
            <FolderPlus size={16} />
            <span>{t.publicConfigs}</span>
          </TabsTrigger>
          <TabsTrigger value="create-config" className="flex items-center gap-2">
            <Plus size={16} />
            <span>{t.createConfig}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-configs">
          <div className="mb-4">
            <Input 
              placeholder={t.searchPlaceholder}
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {myConfigs.map(config => (
              <Card key={config.id} className="p-4 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1 flex-1">
                    {editingConfigId === config.id ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={newConfigName}
                          onChange={e => setNewConfigName(e.target.value)}
                          className="text-lg font-medium h-8"
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          onClick={() => saveEditedConfig(config.id)}
                          className="p-0 w-8 h-8"
                          variant="ghost"
                        >
                          <Check size={16} className="text-green-500" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={cancelEdit}
                          className="p-0 w-8 h-8"
                          variant="ghost"
                        >
                          <X size={16} className="text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium mr-2">{config.name}</h3>
                        <Badge isPublic={config.isPublic} language={language} />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {config.description}
                    </p>
                  </div>
                  <FileCode size={24} className="text-primary/80" />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span>{t.downloads}: {config.downloads}</span>
                  <span>•</span>
                  <span>{t.created}: {config.createdAt}</span>
                </div>
                
                <div className="flex justify-between mt-2">
                  <Button 
                    onClick={() => handleDownloadConfig(config)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Download size={14} />
                    {t.download}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      onClick={() => handleDuplicateConfig(config)}
                      size="sm" 
                      variant="ghost"
                      className="p-0 w-8 h-8"
                    >
                      <Copy size={14} />
                    </Button>
                    <Button 
                      onClick={() => handleEditConfig(config)}
                      size="sm" 
                      variant="ghost"
                      className="p-0 w-8 h-8"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteConfig(config.id)}
                      size="sm" 
                      variant="ghost"
                      className="p-0 w-8 h-8 text-red-500 hover:text-red-400"
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="public-configs">
          <div className="mb-4">
            <Input 
              placeholder={t.searchPlaceholder}
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {publicConfigs.map(config => (
              <Card key={config.id} className="p-4 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{config.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {config.description}
                    </p>
                  </div>
                  <FileCode size={24} className="text-primary/80" />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span>{t.author}: {config.author}</span>
                  <span>•</span>
                  <span>{t.downloads}: {config.downloads}</span>
                  <span>•</span>
                  <span>{t.created}: {config.createdAt}</span>
                </div>
                
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={() => handleDownloadConfig(config)}
                    size="sm"
                    className="flex items-center gap-1 bg-primary hover:bg-primary/90"
                  >
                    <Download size={14} />
                    {t.download}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="create-config">
          <Card className="p-6 bg-background/50 backdrop-blur-sm">
            <form onSubmit={handleCreateConfig} className="space-y-4">
              <div>
                <label htmlFor="config-name" className="block text-sm font-medium mb-1">
                  {t.configName}
                </label>
                <Input 
                  id="config-name"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder={language === 'pt-BR' ? 'Minha Configuração' : 'My Configuration'}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="config-description" className="block text-sm font-medium mb-1">
                  {t.configDescription}
                </label>
                <Input 
                  id="config-description"
                  value={configDescription}
                  onChange={(e) => setConfigDescription(e.target.value)}
                  placeholder={language === 'pt-BR' ? 'Descreva sua configuração' : 'Describe your configuration'}
                />
              </div>
              
              <div>
                <label htmlFor="config-content" className="block text-sm font-medium mb-1">
                  {t.configContent}
                </label>
                <Textarea 
                  id="config-content"
                  value={configContent}
                  onChange={(e) => setConfigContent(e.target.value)}
                  placeholder={language === 'pt-BR' ? 'Cole o conteúdo JSON da sua configuração aqui' : 'Paste your configuration JSON content here'}
                  className="font-mono text-sm h-40"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  id="is-public"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="is-public" className="text-sm">
                  {t.makePublic}
                </label>
              </div>
              
              <div>
                <label htmlFor="config-file" className="block text-sm font-medium mb-1">
                  {t.uploadFile}
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="config-file"
                    type="file"
                    accept=".json,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("config-file")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? selectedFile.name : t.chooseFile}
                  </Button>
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSelectedFile(null);
                        setConfigContent("");
                      }}
                      className="text-red-500"
                      size="sm"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="pt-2 flex justify-end gap-2">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                >
                  {t.create}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for visibility badge
const Badge: React.FC<{ isPublic: boolean; language: string }> = ({ isPublic, language }) => {
  return isPublic ? (
    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
      {language === 'pt-BR' ? 'Pública' : 'Public'}
    </span>
  ) : (
    <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">
      {language === 'pt-BR' ? 'Privada' : 'Private'}
    </span>
  );
};

export default ConfigsSection;
